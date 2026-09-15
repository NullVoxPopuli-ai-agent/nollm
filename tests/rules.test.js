import { describe, expect, test } from "vitest";
import { check } from "../src/index.js";
import { ids, texts } from "./helpers.js";

function prose(text) {
  return check("doc.md", text);
}

function comment(text) {
  return check("code.js", `// ${text}\n`);
}

describe("banned-word", () => {
  test("flags each banned word once", () => {
    const findings = prose("This is genuinely load-bearing and fails loudly.");
    expect(texts(findings)).toEqual(["genuinely", "load-bearing", "fails loudly"]);
  });

  test("is case insensitive", () => {
    expect(ids(prose("Spearheaded the effort"))).toEqual(["banned-word"]);
  });

  test("ignores words inside identifiers", () => {
    expect(prose("carryingCapacity")).toEqual([]);
  });
});

describe("em-dash", () => {
  test("flags the em dash character", () => {
    expect(ids(prose("one — two"))).toEqual(["em-dash"]);
  });

  test("allows hyphens and en dashes", () => {
    expect(prose("one - two – three")).toEqual([]);
  });
});

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

describe("filler-word", () => {
  test("flags filler words and phrases", () => {
    const findings = prose("Simply utilize this in order to leverage the robust API.");
    expect(texts(findings)).toEqual(["Simply", "utilize", "in order to", "leverage", "robust"]);
  });
});

describe("llm-vocabulary", () => {
  test("flags typical model vocabulary", () => {
    const findings = prose("Let's dive into this crucial, game-changer tapestry.");
    expect(ids(findings)).toContain("llm-vocabulary");
    expect(texts(findings)).toContain("tapestry");
  });
});

describe("chat-opener", () => {
  test("flags an opener at the start of a line", () => {
    expect(ids(prose("Great question! The answer is yes."))).toEqual(["chat-opener"]);
    expect(ids(prose("Certainly, here is the code."))).toEqual(["chat-opener"]);
  });

  test("flags an opener at the start of a comment", () => {
    expect(ids(comment("Sure, this can be improved."))).toEqual(["chat-opener"]);
  });

  test("allows the same words mid sentence", () => {
    expect(prose("Make sure the file exists.")).toEqual([]);
  });
});

describe("chat-closer", () => {
  test("flags a closer", () => {
    expect(ids(prose("Hope this helps! Let me know if you need more."))).toEqual([
      "chat-closer",
      "chat-closer",
    ]);
  });

  test("allows 'anything else' in ordinary prose", () => {
    expect(prose("Anything else is an error.")).toEqual([]);
  });
});

describe("ai-disclosure", () => {
  test("flags assistant self reference", () => {
    expect(ids(prose("As an AI, I cannot run this."))).toEqual(["ai-disclosure"]);
  });
});

describe("error-exclamation", () => {
  test("flags exclamations in code, not only in comments", () => {
    // nollm-ignore-next-line
    const findings = check("code.js", 'throw new Error("Oops! Something went wrong");\n');
    // nollm-ignore-next-line
    expect(texts(findings)).toEqual(["Oops", "Something went wrong"]);
  });
});

describe("contrast-cliche", () => {
  test("flags 'not just X, but Y'", () => {
    expect(ids(prose("It is not just fast, but also safe."))).toEqual(["contrast-cliche"]);
  });

  test("flags 'it's not X, it's Y'", () => {
    expect(ids(prose("It's not a bug, it's a feature."))).toEqual(["contrast-cliche"]);
  });
});

describe("rhetorical-question", () => {
  test("flags 'Why? Because'", () => {
    expect(ids(prose("Why? Because the cache is cold."))).toEqual(["rhetorical-question"]);
  });

  test("does not run in comments", () => {
    expect(comment("The result? A faster build.")).toEqual([]);
  });
});

describe("emoji", () => {
  test("flags emoji", () => {
    expect(texts(prose("Ship it \u{1F680}"))).toEqual(["\u{1F680}"]);
  });

  test("allows text symbols like arrows", () => {
    expect(prose("a ↔ b → c")).toEqual([]);
  });
});

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

describe("what-comment", () => {
  test("flags comments that narrate the code", () => {
    expect(ids(comment("This function returns the user"))).toEqual(["what-comment"]);
    expect(ids(comment("Loop over the entries"))).toEqual(["what-comment"]);
  });

  test("allows comments that explain why", () => {
    expect(comment("The API returns null on weekends, so retry on Monday")).toEqual([]);
  });
});
