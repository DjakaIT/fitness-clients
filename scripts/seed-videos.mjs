#!/usr/bin/env node
/**
 * Uploads the exercise video catalogue into Firestore.
 *
 * The catalogue used to be a source file, which meant adding a video needed a
 * developer, a rebuild and a store release — and put the (often unlisted)
 * YouTube ids in the repository. This moves it into the `videos` collection,
 * where the trainer owns it.
 *
 * **Document ids are preserved exactly.** Saved workout programs reference
 * exercises by those ids, so changing them would silently break every existing
 * program.
 *
 * Dry run by default.
 *
 *   $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\serviceAccountKey.json"
 *   node scripts/seed-videos.mjs            # show what would be written
 *   node scripts/seed-videos.mjs --apply    # write it
 *
 * Flags:
 *   --apply         actually write (default: dry run)
 *   --prune         delete videos in Firestore that are absent from the source
 *   --project <id>  override the project id
 */
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const valueOf = (flag) => {
  const i = args.indexOf(flag);
  return i === -1 ? undefined : args[i + 1];
};

const APPLY = has("--apply");
const PRUNE = has("--prune");

function die(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

const SOURCE = new URL("../backend/data/videos.js", import.meta.url);
if (!existsSync(SOURCE)) {
  die(
    "backend/data/videos.js is not here.\n" +
      "  It is gitignored on purpose — it is only the seed source, and the\n" +
      "  catalogue now lives in Firestore. If you are setting up a fresh\n" +
      "  project, add videos from the Firebase console instead.",
  );
}

const { VIDEOS } = await import(SOURCE);

if (!Array.isArray(VIDEOS) || VIDEOS.length === 0) {
  die("VIDEOS is empty — nothing to seed.");
}

function loadProjectId() {
  const explicit = valueOf("--project");
  if (explicit) return explicit;
  try {
    const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
    const line = env
      .split(/\r?\n/)
      .find((l) => l.startsWith("EXPO_PUBLIC_FIREBASE_PROJECT_ID="));
    if (line) return line.split("=")[1].trim();
  } catch {
    /* fall through */
  }
  return undefined;
}

let admin;
try {
  admin = require("firebase-admin");
} catch {
  die("firebase-admin is not installed. Run: npm install");
}

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  die(
    "GOOGLE_APPLICATION_CREDENTIALS is not set.\n" +
      "  Firebase console → Project settings → Service accounts → Generate new private key,\n" +
      "  then point this at it.",
  );
}

const projectId = loadProjectId();
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  ...(projectId ? { projectId } : {}),
});

const db = admin.firestore();

/** Rejects entries that would render as a broken card. */
function validate(video, index) {
  const problems = [];
  if (!video?.id) problems.push("missing id");
  if (!video?.youtubeID) problems.push("missing youtubeID");
  if (!video?.title) problems.push("missing title");
  if (!video?.category) problems.push("missing category");
  return problems.length ? `#${index}: ${problems.join(", ")}` : null;
}

async function main() {
  console.log(
    `\nProject: ${projectId ?? "(from credentials)"}   Mode: ${
      APPLY ? "APPLY — writes enabled" : "dry run"
    }\n`,
  );

  const problems = VIDEOS.map(validate).filter(Boolean);
  if (problems.length) {
    die(`Source catalogue has invalid entries:\n  ${problems.join("\n  ")}`);
  }

  const ids = VIDEOS.map((v) => String(v.id));
  const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (duplicates.length) {
    die(
      `Duplicate ids in the source catalogue: ${[...new Set(duplicates)].join(", ")}\n` +
        "  Ids are document keys, so duplicates would overwrite each other.",
    );
  }

  const existing = await db.collection("videos").get();
  const existingIds = new Set(existing.docs.map((d) => d.id));
  const sourceIds = new Set(ids);
  const orphans = [...existingIds].filter((id) => !sourceIds.has(id));

  const categories = [...new Set(VIDEOS.map((v) => v.category))];

  console.log(`Videos in source:      ${VIDEOS.length}`);
  console.log(`Already in Firestore:  ${existing.size}`);
  console.log(`Categories:            ${categories.join(", ")}`);
  console.log(
    `In Firestore only:     ${orphans.length}${
      orphans.length && !PRUNE ? "  (left alone; pass --prune to delete)" : ""
    }\n`,
  );

  if (!APPLY) {
    console.log("Sample of what would be written:");
    for (const v of VIDEOS.slice(0, 3)) {
      console.log(`  videos/${v.id}  ${v.category} — ${v.title}`);
    }
    if (VIDEOS.length > 3) console.log(`  … and ${VIDEOS.length - 3} more`);
    console.log("\nDry run — nothing was written. Re-run with --apply.\n");
    return;
  }

  // Batched so a large catalogue stays within Firestore's 500-op limit.
  const CHUNK = 400;
  let written = 0;
  for (let i = 0; i < VIDEOS.length; i += CHUNK) {
    const batch = db.batch();
    for (const [offset, video] of VIDEOS.slice(i, i + CHUNK).entries()) {
      batch.set(
        db.collection("videos").doc(String(video.id)),
        {
          youtubeID: video.youtubeID,
          title: video.title,
          category: video.category,
          // Preserves the catalogue's own ordering; useVideos sorts on it.
          order: i + offset,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
      written += 1;
    }
    await batch.commit();
  }

  if (PRUNE && orphans.length) {
    const batch = db.batch();
    for (const id of orphans) batch.delete(db.collection("videos").doc(id));
    await batch.commit();
    console.log(`Deleted ${orphans.length} video(s) not in the source.`);
  }

  console.log(`\n✓ Wrote ${written} video(s) to Firestore.\n`);
}

main().catch((error) => {
  console.error("\n✗ Seeding failed:", error.message, "\n");
  process.exit(1);
});
