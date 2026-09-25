#!/usr/bin/env node
/**
 * Writes the coaching tips from backend/data/exerciseTips.js onto the video
 * documents in Firestore (`videos/{id}.tips`).
 *
 * Only the `tips` field is touched. Each entry's title is checked against the
 * stored video title first, so a renumbered catalogue cannot silently attach
 * squat advice to a plank. By default an existing, different `tips` value is
 * left alone — the trainer may have edited it in the console — and reported.
 *
 * Dry run by default.
 *
 *   $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\serviceAccountKey.json"
 *   node scripts/seed-tips.mjs            # show what would change
 *   node scripts/seed-tips.mjs --apply    # write it
 *
 * Flags:
 *   --apply        actually write (default: dry run)
 *   --overwrite    replace tips the trainer has already edited
 *   --project <id> override the project id
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { EXERCISE_TIPS } from "../backend/data/exerciseTips.js";
import { normalizeTips } from "../src/utils/exerciseTips.js";

const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const valueOf = (f) => {
  const i = args.indexOf(f);
  return i === -1 ? undefined : args[i + 1];
};

const APPLY = has("--apply");
const OVERWRITE = has("--overwrite");

function die(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
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
  die("GOOGLE_APPLICATION_CREDENTIALS is not set.");
}

const projectId = loadProjectId();
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  ...(projectId ? { projectId } : {}),
});
const db = admin.firestore();

const norm = (s) =>
  String(s ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

async function main() {
  console.log(
    `\nProject: ${projectId ?? "(from credentials)"}   Mode: ${
      APPLY ? "APPLY — writes enabled" : "dry run"
    }\n`,
  );

  const snapshot = await db.collection("videos").get();
  const byId = new Map(snapshot.docs.map((d) => [d.id, d.data()]));

  const writes = [];
  const missing = [];
  const titleMismatch = [];
  const keptEdited = [];
  let unchanged = 0;

  for (const [id, entry] of Object.entries(EXERCISE_TIPS)) {
    const video = byId.get(String(id));
    if (!video) {
      missing.push(id);
      continue;
    }
    if (norm(video.title) !== norm(entry.title)) {
      titleMismatch.push({ id, stored: video.title, expected: entry.title });
      continue;
    }

    const tips = normalizeTips(entry.tips);
    if (tips.length !== entry.tips.length) {
      die(`Entry ${id} has an invalid tip — fix backend/data/exerciseTips.js.`);
    }

    const current = video.tips;
    if (same(current, tips)) {
      unchanged += 1;
    } else if (Array.isArray(current) && current.length && !OVERWRITE) {
      keptEdited.push(id);
    } else {
      writes.push({ id, tips });
    }
  }

  console.log(`Videos in Firestore:     ${byId.size}`);
  console.log(`Entries in tips file:    ${Object.keys(EXERCISE_TIPS).length}`);
  console.log(`To write:                ${writes.length}`);
  console.log(`Already up to date:      ${unchanged}`);
  console.log(`Edited, left alone:      ${keptEdited.length}`);
  console.log(`No such video:           ${missing.length}`);
  console.log(`Title mismatch (skipped):${titleMismatch.length}\n`);

  for (const m of titleMismatch) {
    console.log(`  ⚠ ${m.id}: stored "${m.stored}" ≠ tips for "${m.expected}"`);
  }
  if (keptEdited.length) {
    console.log(
      `  Kept trainer edits on: ${keptEdited.join(", ")} (pass --overwrite to replace)`,
    );
  }

  if (!APPLY) {
    console.log("\nDry run — nothing was written. Re-run with --apply.\n");
    return;
  }
  if (!writes.length) {
    console.log("\nNothing to do.\n");
    return;
  }

  const batch = db.batch();
  for (const { id, tips } of writes) {
    batch.update(db.collection("videos").doc(String(id)), { tips });
  }
  await batch.commit();
  console.log(`\n✓ Wrote tips for ${writes.length} video(s).\n`);
}

main().catch((error) => {
  console.error("\n✗ Seeding tips failed:", error.message, "\n");
  process.exit(1);
});
