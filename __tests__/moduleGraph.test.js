/**
 * Import smoke test: every screen, hook and util must at least load. This is
 * what catches a rename that left a dangling import behind — cheap to run, and
 * it fails on the exact module rather than at app start on a device.
 */
import fs from "fs";
import path from "path";

const ROOT = path.join(__dirname, "..");

function collect(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full, acc);
    else if (/\.jsx?$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

const modules = [
  ...collect(path.join(ROOT, "src")),
  ...collect(path.join(ROOT, "backend", "utils")),
  ...collect(path.join(ROOT, "backend", "services")),
  ...collect(path.join(ROOT, "backend", "config")),
].filter((f) => !f.includes("firebase.js"));

describe("module graph", () => {
  it("finds the source tree", () => {
    expect(modules.length).toBeGreaterThan(40);
  });

  it.each(
    modules.map((m) => [path.relative(ROOT, m).split(path.sep).join("/"), m]),
  )("loads %s", (_name, file) => {
    expect(() => require(file)).not.toThrow();
  });
});
