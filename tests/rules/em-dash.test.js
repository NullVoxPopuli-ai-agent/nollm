import { describe, expect, test } from "vitest";
import { check, rules } from "../../src/index.js";
import { ids, prose } from "../helpers.js";

function withEmDash(text) {
  return check("doc.md", text, rules);
}

describe("em-dash", () => {
  test("is off by default", () => {
    expect(prose("one \u2014 two")).toEqual([]);
  });

  test("flags the em dash character when on", () => {
    expect(ids(withEmDash("one \u2014 two"))).toEqual(["em-dash"]);
  });

  test("allows hyphens and en dashes", () => {
    expect(withEmDash("one - two \u2013 three")).toEqual([]);
  });
});
