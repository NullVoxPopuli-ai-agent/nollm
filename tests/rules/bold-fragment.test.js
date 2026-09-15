import { describe, expect, test } from "vitest";
import { comment, ids, prose } from "../helpers.js";

describe("bold-fragment", () => {
  test("flags a bold label followed by text", () => {
    expect(ids(prose("**Note:** the file must exist"))).toEqual(["bold-fragment"]);
    expect(ids(prose("- **Fast** because it uses workers"))).toEqual(["bold-fragment"]);
  });

  test("allows a bold line on its own", () => {
    expect(prose("**Warning**")).toEqual([]);
  });

  test("does not run in comments", () => {
    expect(comment("**Note:** the file must exist")).toEqual([]);
  });
});
