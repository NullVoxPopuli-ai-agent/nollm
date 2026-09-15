import { describe, expect, test } from "vitest";
import { classify, extractComments } from "../src/index.js";

function comments(file, source) {
  return extractComments(source, classify(file).language);
}

describe("extractComments", () => {
  test("finds line and block comments with positions", () => {
    const source = "let a = 1; // one\n/* two\n   three */\nlet b;\n";
    expect(comments("a.js", source)).toEqual([
      { text: "// one", line: 1, column: 12 },
      { text: "/* two", line: 2, column: 1 },
      { text: "   three */", line: 3, column: 1 },
    ]);
  });

  test("ignores comment markers inside strings", () => {
    const source = 'const url = "https://x.y//z"; // real\nconst t = `a // b\n c`; // after\n';
    expect(comments("a.js", source).map((s) => s.text)).toEqual(["// real", "// after"]);
  });

  test("tracks lines across template literals", () => {
    const source = "const t = `\n\n`; // here\n";
    expect(comments("a.js", source)).toEqual([{ text: "// here", line: 3, column: 4 }]);
  });

  test("does not let an unterminated quote in one line swallow the next", () => {
    const source = "const s = 'it\nlet b = 1; // kept\n";
    expect(comments("a.js", source).map((s) => s.text)).toEqual(["// kept"]);
  });

  test("handles hash comments and python docstrings", () => {
    const source = 'x = "#no"  # yes\ndef f():\n    """doc"""\n';
    expect(comments("a.py", source).map((s) => s.text)).toEqual(["# yes", '"""doc"""']);
  });

  test("uses one quote style for rust so lifetimes do not open strings", () => {
    const source = "fn f<'a>(x: &'a str) {} // ok\n";
    expect(comments("a.rs", source).map((s) => s.text)).toEqual(["// ok"]);
  });

  test("reads html comments and script regions", () => {
    const source = "<!-- top -->\n<script>\n// inner\n</script>\n<p>// text</p>\n";
    expect(comments("a.html", source).map((s) => s.text)).toEqual(["<!-- top -->", "// inner"]);
  });

  test("reads glimmer comments inside gjs templates", () => {
    const source =
      "// js\n<template>\n  {{! hbs }}\n  {{!-- block --}}\n  <p>don't // text</p>\n</template>\n// after\n";
    expect(comments("a.gjs", source).map((s) => s.text)).toEqual([
      "// js",
      "{{! hbs }}",
      "{{!-- block --}}",
      "// after",
    ]);
  });

  test("reads yaml comments after unquoted apostrophes", () => {
    const source = "title: don't stop # note\n";
    expect(comments("a.yml", source).map((s) => s.text)).toEqual(["# note"]);
  });
});
