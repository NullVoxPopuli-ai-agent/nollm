import { describe, expect, test } from "vitest";
import { prose, texts } from "../helpers.js";

describe("emoji", () => {
  test("flags emoji", () => {
    expect(texts(prose("Ship it \u{1F680}"))).toEqual(["\u{1F680}"]);
  });

  test("allows text symbols like arrows", () => {
    expect(prose("a ↔ b → c")).toEqual([]);
  });
});
