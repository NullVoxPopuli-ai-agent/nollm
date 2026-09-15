import { describe, expect, test } from "vitest";
import { comment, ids, prose } from "../helpers.js";

describe("diff-comment", () => {
  test("flags comments that describe the change", () => {
    expect(ids(comment("no longer needed, as discussed"))).toEqual([
      "diff-comment",
      "diff-comment",
    ]);
  });

  test("does not run in prose", () => {
    expect(prose("This field is no longer required.")).toEqual([]);
  });
});
