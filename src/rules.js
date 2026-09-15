/**
 * A rule is a regular expression plus a message.
 *
 * scope controls where the rule runs:
 *   prose      → markdown and text files
 *   comments   → comments inside code files
 *   everywhere → every line of every file
 *
 * A rule with no scope runs in prose and in comments.
 *
 * Patterns must have the g flag.
 */

function words(list) {
  return list.map(escape).join("|");
}

function anyOf(list) {
  return new RegExp(String.raw`\b(?:${words(list)})\b`, "gi");
}

function escape(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const BANNED_WORDS = [
  "genuinely",
  "fails loudly",
  "fails quietly",
  "spearheaded",
  "exactly the crutch",
  "crutch",
  "load bearing",
  "load-bearing",
  "carrying",
];

const FILLER_WORDS = [
  "simply",
  "seamlessly",
  "seamless",
  "robust",
  "powerful",
  "comprehensive",
  "leverage",
  "leverages",
  "leveraged",
  "leveraging",
  "utilize",
  "utilizes",
  "utilized",
  "utilizing",
  "in order to",
  "prior to",
  "in the event that",
  "it is worth noting",
  "it's worth noting",
  "it is important to note",
  "it's important to note",
  "it should be noted",
  "keep in mind",
];

const LLM_VOCABULARY = [
  "delve",
  "delves",
  "delving",
  "tapestry",
  "streamline",
  "streamlines",
  "streamlined",
  "cutting-edge",
  "game-changer",
  "game changer",
  "at its core",
  "deep dive",
  "dive into",
  "let's dive",
  "multifaceted",
  "pivotal",
  "crucial",
  "myriad",
  "plethora",
  "foster",
  "fosters",
  "meticulous",
  "meticulously",
  "a testament to",
  "in today's",
  "fast-paced",
  "ever-evolving",
  "effortlessly",
  "supercharge",
  "state-of-the-art",
  "battle-tested",
  "production-ready",
  "blazing fast",
  "blazingly fast",
  "lightning-fast",
  "lightning fast",
  "elevate your",
  "empower",
  "empowers",
  "empowering",
  "navigate the complexities",
  "unlock the",
];

const CHAT_OPENERS = [
  "great question",
  "good question",
  "certainly",
  "absolutely",
  "sure thing",
  "sure",
  "of course",
  "let me",
  "i will",
  "i'll",
  "looking at your",
  "here's a",
  "here is a",
  "i'd be happy to",
  "i would be happy to",
];

const CHAT_CLOSERS = [
  "let me know if",
  "hope this helps",
  "hope that helps",
  "feel free to",
  "happy to help",
  "don't hesitate to",
  "do not hesitate to",
  "if you have any questions",
  "if there is anything else",
  "if there's anything else",
  "anything else i can",
];

const AI_DISCLOSURES = [
  "as an ai",
  "as a language model",
  "as a large language model",
  "i apologize for the confusion",
  "i apologize for any confusion",
  "i don't have access to",
  "i cannot browse",
  "my knowledge cutoff",
  "my training data",
];

const ERROR_EXCLAMATIONS = [
  "uh oh",
  "uh-oh",
  "oh no",
  "oops",
  "whoops",
  "there seems to be a problem",
  "something went wrong",
];

const DIFF_TALK = [
  "as requested",
  "as discussed",
  "per the discussion",
  "per our discussion",
  "per the review",
  "per review",
  "this pr",
  "this commit",
  "this diff",
  "this change",
  "no longer",
  "used to be",
  "used to use",
  "used to return",
  "previously",
  "formerly",
  "the old implementation",
  "the old version",
  "the old code",
  "the old approach",
  "the old way",
  "updated to",
  "changed to",
  "instead of the old",
  "instead of the previous",
  "we removed",
  "we replaced",
  "we migrated",
  "we switched",
  "now uses",
  "now returns",
  "now handles",
  "now lives",
  "moved to",
];

const WHAT_COMMENT_STARTS = [
  "this function",
  "this method",
  "this class",
  "this component",
  "this helper",
  "this hook",
  "this file",
  "this module",
  "this variable",
  "this constant",
  "this line",
  "loop over",
  "loop through",
  "iterate over",
  "iterate through",
  "check if",
  "checks if",
  "increment",
  "decrement",
  "set the",
  "sets the",
  "get the",
  "gets the",
  "create a new",
  "creates a new",
  "initialize the",
  "initializes the",
  "import the",
  "imports the",
  "define the",
  "defines the",
  "call the",
  "calls the",
  "declare",
];

// A comment starts after its marker, so the rule skips the marker first.
const COMMENT_START = String.raw`^\s*(?:\/\/+|#+|\*+|\/\*+|<!--|--|;+|%+|"""|''')?\s*`;

export const rules = [
  {
    id: "banned-word",
    message: "Banned word",
    pattern: anyOf(BANNED_WORDS),
  },
  {
    id: "em-dash",
    message: "Em dash. Use a comma, a colon, or a new sentence",
    pattern: /\u2014/g,
  },
  {
    id: "bold-fragment",
    message: "Bold fragment followed by plain text",
    pattern: /^\s*(?:[-*+]|\d+[.)])?\s*(?:\*\*[^*\n]{1,80}\*\*|__[^_\n]{1,80}__):?\s+\S/gm,
    scope: "prose",
  },
  {
    id: "filler-word",
    message: "Filler. Delete it or replace it",
    pattern: anyOf(FILLER_WORDS),
  },
  {
    id: "llm-vocabulary",
    message: "LLM vocabulary",
    pattern: anyOf(LLM_VOCABULARY),
  },
  {
    id: "chat-opener",
    message: "Chat opener. Start with the answer",
    pattern: new RegExp(
      String.raw`${COMMENT_START}(?:[-*+]\s+)?(?:${words(CHAT_OPENERS)})\b[!,:]?`,
      "gmi",
    ),
  },
  {
    id: "chat-closer",
    message: "Chat closer. Stop when the content stops",
    pattern: anyOf(CHAT_CLOSERS),
  },
  {
    id: "ai-disclosure",
    message: "Text written from the point of view of a chat assistant",
    pattern: anyOf(AI_DISCLOSURES),
  },
  {
    id: "error-exclamation",
    message: "Error message with an exclamation instead of a cause",
    pattern: anyOf(ERROR_EXCLAMATIONS),
    scope: "everywhere",
  },
  {
    id: "contrast-cliche",
    message: "Contrast cliche (not just X, but Y)",
    pattern:
      /\b(?:not (?:just|only|merely|simply) [^.\n]{1,60}?,? but(?: also)?\b|it'?s not (?:just |about )?[^.\n]{1,40}?[,;] it'?s\b)/gi,
  },
  {
    id: "rhetorical-question",
    message: "Rhetorical question followed by its answer",
    pattern:
      /(?:\bwhy\? because\b|\bthe (?:result|catch|problem|solution|answer|best part|good news|bottom line|difference)\?)/gi,
    scope: "prose",
  },
  {
    id: "emoji",
    message: "Emoji",
    pattern: /(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}\uFE0F)/gu,
  },
  {
    id: "diff-comment",
    message: "Comment describes the change, not the code. Put it in the commit message",
    pattern: anyOf(DIFF_TALK),
    scope: "comments",
  },
  {
    id: "what-comment",
    message: "Comment narrates what the code does. Say why, or delete it",
    pattern: new RegExp(String.raw`${COMMENT_START}(?:${words(WHAT_COMMENT_STARTS)})\b`, "gmi"),
    scope: "comments",
  },
];
