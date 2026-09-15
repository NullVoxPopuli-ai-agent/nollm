import { describe, expect, test } from "vitest";
import { prose, texts } from "../helpers.js";

describe("filler-word", () => {
  test("flags filler words and phrases", () => {
    const findings = prose("Simply utilize this in order to leverage the robust API.");
    expect(texts(findings)).toEqual(["Simply", "utilize", "in order to", "leverage", "robust"]);
  });
});
