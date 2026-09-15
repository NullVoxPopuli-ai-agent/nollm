import { execFile } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, test } from "vitest";
import { bin, copyFixture } from "./helpers.js";

const run = promisify(execFile);
let cleanup = async () => {};

afterEach(async () => {
  await cleanup();
});

async function nollm(args, cwd) {
  try {
    const result = await run(process.execPath, [bin].concat(args), {
      cwd,
      env: { ...process.env, NO_COLOR: "1" },
    });
    return { code: 0, ...result };
  } catch (error) {
    return { code: error.code, stdout: error.stdout, stderr: error.stderr };
  }
}

async function project() {
  const copy = await copyFixture("project");
  cleanup = copy.cleanup;
  return copy.dir;
}

describe("cli", () => {
  test("prints one line per finding and exits with 1", async () => {
    const dir = await project();
    const { code, stdout } = await nollm(["--no-git", "--jobs", "2"], dir);
    expect(code).toBe(1);
    expect(stdout).toContain(
      'README.md:3:14  filler-word  Filler. Delete it or replace it: "simply"',
    );
    expect(stdout).toContain(
      'src/index.js:1:1  what-comment  Comment narrates what the code does. Say why, or delete it: "// This function"',
    );
    expect(stdout).toContain(
      // nollm-ignore-next-line
      'src/index.js:8:25  error-exclamation  Error message with an exclamation instead of a cause: "Oops"',
    );
    expect(stdout).toContain(
      'src/math.py:2:8  filler-word  Filler. Delete it or replace it: "Simply"',
    );
    expect(stdout).not.toContain("notes.txt");
    expect(stdout).toMatch(/\d+ problems in 3 files \(5 files checked, [\d.]+s\)\n$/);
  });

  test("skips files that git ignores", async () => {
    const dir = await project();
    await writeFile(join(dir, "debug.log"), "genuinely\n");
    const { stdout } = await nollm(["--no-git"], dir);
    expect(stdout).not.toContain("debug.log");
  });

  test("checks only the given paths", async () => {
    const dir = await project();
    const { stdout } = await nollm(["--no-git", "src/math.py"], dir);
    expect(stdout).not.toContain("README.md");
    expect(stdout).toContain("src/math.py");
  });

  test("respects the config file", async () => {
    const dir = await project();
    await writeFile(
      join(dir, ".nollmrc"),
      '{ "ignore": ["src/"], "rules": { "chat-opener": false } }\n',
    );
    const { stdout } = await nollm(["--no-git"], dir);
    expect(stdout).not.toContain("src/");
    expect(stdout).not.toContain("chat-opener");
    expect(stdout).toContain("chat-closer");
  });

  test("exits with 0 when there is nothing to report", async () => {
    const dir = await project();
    const { code, stdout } = await nollm(["--no-git", "docs"], dir);
    expect(code).toBe(0);
    expect(stdout).toBe(
      "0 problems in 0 files (1 files checked, ".concat(
        stdout.slice(stdout.indexOf("(1 files checked, ") + 18),
      ),
    );
  });

  test("--quiet prints only the summary", async () => {
    const dir = await project();
    const { stdout } = await nollm(["--no-git", "--quiet"], dir);
    expect(stdout.trim().split("\n")).toHaveLength(1);
  });

  test("--list-rules prints every rule", async () => {
    const { code, stdout } = await nollm(["--list-rules"], process.cwd());
    expect(code).toBe(0);
    expect(stdout).toContain("banned-word");
    expect(stdout).toContain("what-comment");
  });

  test("rejects a bad --jobs value", async () => {
    const { code, stderr } = await nollm(["--jobs", "zero"], process.cwd());
    expect(code).toBe(2);
    expect(stderr).toContain("--jobs needs a positive integer");
  });
});
