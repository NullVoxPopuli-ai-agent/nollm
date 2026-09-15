import { describe, expect, test } from "vitest";
import { ids, prose } from "../helpers.js";

describe("em-dash", () => {
  test("flags the em dash character", () => {
    expect(ids(prose("one — two"))).toEqual(["em-dash"]);
  });

  test("allows hyphens and en dashes", () => {
    expect(prose("one - two – three")).toEqual([]);
  });
});
