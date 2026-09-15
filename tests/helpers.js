import { cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { check } from "../src/index.js";

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

/**
 * Checks text as a markdown file.
 */
export function prose(text) {
  return check("doc.md", text);
}

/**
 * Checks text as one line comment in a JavaScript file.
 */
export function comment(text) {
  return check("code.js", `// ${text}\n`);
}

export function ids(findings) {
  return findings.map((finding) => finding.ruleId);
}

export function texts(findings) {
  return findings.map((finding) => finding.text);
}
