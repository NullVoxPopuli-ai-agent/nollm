import { describe, expect, test } from "vitest";
import { check } from "../../src/index.js";
import { texts } from "../helpers.js";

describe("error-exclamation", () => {
  test("flags exclamations in code, not only in comments", () => {
    // nollm-ignore-next-line
    const findings = check("code.js", 'throw new Error("Oops! Something went wrong");\n');
    // nollm-ignore-next-line
    expect(texts(findings)).toEqual(["Oops", "Something went wrong"]);
  });
});
