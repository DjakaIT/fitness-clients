#!/usr/bin/env node
/**
 * Prints the security rules that are LIVE right now and diffs them against
 * firestore.rules in this repo.
 *
 * Deploying replaces the live ruleset wholesale, so anything the console
 * protects that the repo file does not mention would start being denied by the
 * catch-all. Read this diff before `npm run rules:deploy`.
 *
 * Read-only — it never writes anything.
 *
 *   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
 *   npm run rules:diff
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";

const require = createRequire(import.meta.url);

function die(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

function projectIdFromEnvFile() {
  const explicit = process.argv.includes("--project")
    ? process.argv[process.argv.indexOf("--project") + 1]
    : undefined;
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

let GoogleAuth;
try {
  ({ GoogleAuth } = require("google-auth-library"));
} catch {
  die("google-auth-library is not installed. Run: npm install");
}

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  die(
    "GOOGLE_APPLICATION_CREDENTIALS is not set.\n" +
      "  Firebase console → Project settings → Service accounts → Generate new private key,\n" +
      "  then: export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json",
  );
}

const projectId = projectIdFromEnvFile();
if (!projectId) die("Could not determine the project id. Pass --project <id>.");

async function main() {
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();

  const release = await client.request({
    url: `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases/cloud.firestore`,
  });

  const rulesetName = release.data.rulesetName;
  const ruleset = await client.request({
    url: `https://firebaserules.googleapis.com/v1/${rulesetName}`,
  });

  const liveFiles = ruleset.data.source?.files ?? [];
  const live = liveFiles.map((f) => f.content).join("\n");

  const repo = readFileSync(
    new URL("../firestore.rules", import.meta.url),
    "utf8",
  );

  const dir = join(tmpdir(), "marta-fitness-rules");
  mkdirSync(dir, { recursive: true });
  const livePath = join(dir, "live.rules");
  writeFileSync(livePath, live, "utf8");

  const normalise = (s) => s.replace(/\r\n/g, "\n").trim();
  const identical = normalise(live) === normalise(repo);

  console.log(`\nProject:  ${projectId}`);
  console.log(`Ruleset:  ${rulesetName}`);
  console.log(`Updated:  ${ruleset.data.createTime ?? "unknown"}`);
  console.log(`Live copy saved to: ${livePath}\n`);

  // Collections each side mentions — the thing that actually matters, because
  // a collection only the live rules name would fall to the catch-all deny.
  const collectionsIn = (source) =>
    new Set(
      [...source.matchAll(/match\s+\/([A-Za-z0-9_]+)\/\{/g)].map((m) => m[1]),
    );

  const liveCollections = collectionsIn(live);
  const repoCollections = collectionsIn(repo);
  const onlyLive = [...liveCollections].filter((c) => !repoCollections.has(c));

  console.log(
    `Collections live: ${[...liveCollections].sort().join(", ") || "(none found)"}`,
  );
  console.log(
    `Collections repo: ${[...repoCollections].sort().join(", ") || "(none found)"}\n`,
  );

  if (onlyLive.length) {
    console.log(
      "⚠ Only the LIVE rules cover these. After deploying they fall to the\n" +
        "  default-deny catch-all. Confirm nothing still reads them:\n" +
        onlyLive.map((c) => `    - ${c}`).join("\n") +
        "\n",
    );
  } else {
    console.log("✓ The repo file covers every collection the live rules do.\n");
  }

  if (identical) {
    console.log("Live and repo rules are identical — nothing to deploy.\n");
    return;
  }

  console.log("Live and repo rules differ. Full live copy:\n");
  console.log("─".repeat(70));
  console.log(live);
  console.log("─".repeat(70));
  console.log(
    `\nDiff them side by side with:\n  git diff --no-index "${livePath}" firestore.rules\n`,
  );
}

main().catch((error) => {
  const detail = error.response?.data
    ? JSON.stringify(error.response.data, null, 2)
    : error.message;
  die(`Could not read the live rules:\n${detail}`);
});
