#!/usr/bin/env node
// Old Node versions must parse this file to reach the version check.
// A static import of the CLI fails first, on `await using` in src/lint.js.
const MIN_NODE_MAJOR = 24;
const major = Number(process.versions.node.split(".")[0]);

if (major < MIN_NODE_MAJOR) {
  process.stderr.write(
    `nollm requires Node ${MIN_NODE_MAJOR} or newer. This is Node ${process.versions.node}.\n`,
  );
  process.exit(1);
}

const { main } = await import("../src/cli.js");

// A closed pipe, for example `nollm | head`, is not an error.
process.stdout.on("error", (error) => {
  if (error.code === "EPIPE") process.exit(0);
  throw error;
});

process.exitCode = await main(process.argv.slice(2));
