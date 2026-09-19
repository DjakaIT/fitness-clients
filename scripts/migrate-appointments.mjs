#!/usr/bin/env node
/**
 * Moves pre-slot-key appointments onto "<date>_<time>" document ids.
 *
 * Nobody's booking is cancelled: each legacy document is rewritten at its slot
 * id and the old one removed, inside a transaction per slot. Slots two
 * different clients both hold are reported, not resolved — either choice would
 * take a session away from someone.
 *
 * Dry run by default. Nothing is written until you pass --apply.
 *
 *   # 1. Firebase console → Project settings → Service accounts → Generate key
 *   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
 *
 *   node scripts/migrate-appointments.mjs            # show the plan
 *   node scripts/migrate-appointments.mjs --apply    # execute it
 *
 * Flags:
 *   --apply             actually write (default: dry run)
 *   --purge-cancelled   also delete legacy already-cancelled docs
 *   --project <id>      override the project id
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { planMigration } from "../backend/services/appointmentMigration.js";

const require = createRequire(import.meta.url);

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const valueOf = (flag) => {
  const i = args.indexOf(flag);
  return i === -1 ? undefined : args[i + 1];
};

const APPLY = has("--apply");
const PURGE_CANCELLED = has("--purge-cancelled");

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

function die(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
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
      "  then: export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json",
  );
}

const projectId = loadProjectId();
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  ...(projectId ? { projectId } : {}),
});

const db = admin.firestore();

const millisOf = (value) => {
  if (!value) return undefined;
  if (typeof value.toMillis === "function") return value.toMillis();
  return undefined;
};

async function main() {
  console.log(
    `\nProject: ${projectId ?? "(from credentials)"}   Mode: ${
      APPLY ? "APPLY — writes enabled" : "dry run"
    }\n`,
  );

  const snapshot = await db.collection("appointments").get();
  const docs = snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      data: { ...data, createdAtMillis: millisOf(data.createdAt) },
    };
  });

  const plan = planMigration(docs, { purgeCancelled: PURGE_CANCELLED });

  console.log(`Documents scanned:        ${docs.length}`);
  console.log(`Already slot-keyed:       ${plan.alreadyMigrated}`);
  console.log(`To migrate:               ${plan.moves.length}`);
  console.log(`Cancelled, left alone:    ${plan.cancelledLeftAlone.length}`);
  console.log(`Malformed, skipped:       ${plan.malformed.length}`);
  console.log(`Conflicts (need a human): ${plan.conflicts.length}\n`);

  for (const move of plan.moves) {
    const label =
      move.toId === null
        ? `${move.action.padEnd(7)} ${move.fromId} (cancelled)`
        : `${move.action.padEnd(7)} ${move.fromId}  →  ${move.toId}`;
    console.log(`  ${label}`);
  }

  if (plan.malformed.length) {
    console.log("\nMalformed documents (left untouched):");
    for (const m of plan.malformed) console.log(`  ${m.id}`);
  }

  if (plan.conflicts.length) {
    console.log(
      "\n⚠ Two clients hold the same slot. Resolve these by hand — decide who\n" +
        "  keeps the session, then re-run:",
    );
    for (const c of plan.conflicts) {
      console.log(
        `  ${c.toId}: kept ${c.keptUserId}, still on legacy doc ${c.id} → ${c.losingUserId}`,
      );
    }
  }

  if (!APPLY) {
    console.log("\nDry run — nothing was written. Re-run with --apply.\n");
    return;
  }

  if (plan.moves.length === 0) {
    console.log("\nNothing to do.\n");
    return;
  }

  let done = 0;
  for (const move of plan.moves) {
    const fromRef = db.collection("appointments").doc(move.fromId);

    if (move.action === "delete") {
      await fromRef.delete();
      done += 1;
      continue;
    }

    // Cancelled leftovers keep their document but lose the name and photo the
    // old code stored on it.
    if (move.action === "redact") {
      await fromRef.update({
        userName: admin.firestore.FieldValue.delete(),
        userPhoto: admin.firestore.FieldValue.delete(),
      });
      done += 1;
      continue;
    }

    const toRef = db.collection("appointments").doc(move.toId);

    // Per-slot transaction: re-read the target so a booking made between the
    // plan and the write is never silently overwritten.
    await db.runTransaction(async (tx) => {
      const [targetSnap, sourceSnap] = await Promise.all([
        tx.get(toRef),
        tx.get(fromRef),
      ]);

      if (!sourceSnap.exists) return; // already handled by an earlier run

      if (targetSnap.exists) {
        const target = targetSnap.data();
        if (
          target.status === "active" &&
          target.userId !== move.payload.userId
        ) {
          throw new Error(
            `slot ${move.toId} was taken by ${target.userId} since the plan was made`,
          );
        }
      }

      tx.set(
        toRef,
        { ...move.payload, migratedAt: new Date() },
        { merge: true },
      );
      tx.delete(fromRef);
    });

    done += 1;
  }

  console.log(`\n✓ Migrated ${done} document(s).\n`);
}

main().catch((error) => {
  console.error("\n✗ Migration failed:", error.message, "\n");
  process.exit(1);
});
