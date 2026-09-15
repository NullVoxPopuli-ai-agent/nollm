import { cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const fixtures = fileURLToPath(new URL("./fixtures/", import.meta.url));
export const bin = fileURLToPath(new URL("../bin/nollm.js", import.meta.url));

/**
 * Copies a fixture project into a fresh temp directory.
 * Returns the directory and a cleanup function.
 */
export async function copyFixture(name) {
  const dir = await mkdtemp(join(tmpdir(), "nollm-"));
  await cp(join(fixtures, name), dir, { recursive: true });
  return { dir, cleanup: () => rm(dir, { recursive: true, force: true }) };
}

export function ids(findings) {
  return findings.map((finding) => finding.ruleId);
}

export function texts(findings) {
  return findings.map((finding) => finding.text);
}
