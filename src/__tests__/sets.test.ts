import { describe, it, expect } from "vitest";
import { ALL_SETS, SET_TOPICS, getSet, getSetTopic, setTests, testHref } from "@/content/sets";
import { MNEMONICS } from "@/content/mnemonics";
import { PSAR_QUESTIONS } from "@/content/psar";
import { setQuestions, setLevelQuestions, topicQuestions, SET_QUIZ_LENGTH, TOPIC_QUIZ_LENGTH } from "@/lib/setQuiz";
import { describeResult, parseDrillResult, setProgress, type LatestResult } from "@/lib/drillResults";
import { getTopic } from "@/content/topics";

const r = (drill: string, item: string, score: number, total: number): LatestResult => ({
  drill,
  item,
  score,
  total,
  mistakes: total - score,
  at: "2026-11-02T00:00:00Z",
});

describe("set content", () => {
  it("has unique slugs, item ids, terms and meanings", () => {
    const slugs = ALL_SETS.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of ALL_SETS) {
      for (const field of ["id", "term", "meaning"] as const) {
        const values = s.items.map((i) => i[field]).filter(Boolean);
        expect(new Set(values).size, `${s.slug} ${field}`).toBe(values.length);
      }
    }
  });

  it("slugs are safe to save as results and don't clash with the mixed quiz", () => {
    for (const s of ALL_SETS) {
      expect(s.slug).toMatch(/^[a-z0-9-]{1,40}$/);
      expect(s.slug).not.toBe("mixed");
    }
  });

  it("scenarios point at real items", () => {
    for (const s of ALL_SETS) {
      for (const sc of s.scenarios ?? []) expect(s.items.map((i) => i.id), `${s.slug}: ${sc.id}`).toContain(sc.answer);
    }
  });

  it("each question kind has what it needs", () => {
    for (const s of ALL_SETS) {
      if (s.questions.includes("scenario")) expect(s.scenarios?.length, s.slug).toBeGreaterThan(0);
      if (s.questions.includes("letter")) expect(s.mnemonic || s.items.every((i) => i.letter), s.slug).toBeTruthy();
      if (s.questions.includes("fact")) expect(s.facts?.length, s.slug).toBeGreaterThan(0);
      if (s.questions.includes("picture")) expect(s.items.some((i) => i.visual), s.slug).toBe(true);
      if (s.questions.includes("next")) expect(s.ordered, s.slug).toBe(true);
      // Decoys must not be real items
      for (const d of s.decoys ?? []) expect(s.items.map((i) => i.term), s.slug).not.toContain(d);
    }
  });
});

describe("topics", () => {
  it("has the four topics, each with sets", () => {
    expect(SET_TOPICS.map((t) => t.id)).toEqual(["communication", "first-aid", "surf-awareness", "patrol"]);
    for (const t of SET_TOPICS) expect(t.sets.length, t.id).toBeGreaterThan(0);
  });

  it("puts every acronym in exactly one set", () => {
    for (const m of MNEMONICS) expect(ALL_SETS.filter((s) => s.mnemonic === m.slug), m.slug).toHaveLength(1);
  });

  it("only points at PSAR questions that exist", () => {
    const ids = new Set(PSAR_QUESTIONS.map((q) => q.id));
    for (const s of ALL_SETS) for (const f of s.facts ?? []) expect(ids.has(f), `${s.slug}: ${f}`).toBe(true);
  });

  it("gives every set at least one test", () => {
    for (const s of ALL_SETS) {
      expect(setTests(s).length, s.slug).toBeGreaterThan(0);
      expect(testHref(s)).toMatch(/^\/(test|study)\//);
    }
  });
});

describe("set quizzes", () => {
  it("has enough questions in every set", () => {
    for (const s of ALL_SETS.filter((x) => x.questions.length)) {
      expect(setQuestions(s).length, s.slug).toBeGreaterThanOrEqual(4);
    }
  });

  it("asks every kind each set lists", () => {
    for (const s of ALL_SETS) {
      const kinds = new Set(setQuestions(s, 999).map((q) => q.id.split(":")[1]));
      for (const k of s.questions) expect(kinds.has(k), `${s.slug}: ${k}`).toBe(true);
    }
  });

  it("always include the answer once, with no duplicate options", () => {
    for (let n = 0; n < 20; n++) {
      const all = [...ALL_SETS.flatMap((s) => setQuestions(s)), ...SET_TOPICS.flatMap((t) => topicQuestions(t.id))];
      for (const q of all) {
        expect(q.options.filter((o) => o === q.answer), q.id).toHaveLength(1);
        expect(new Set(q.options).size, q.id).toBe(q.options.length);
        expect(q.options.length, q.id).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("mixes the set's question kinds", () => {
    const qs = setQuestions(getSet("surf-awareness", "types-of-waves")!);
    expect(qs.length).toBeLessThanOrEqual(SET_QUIZ_LENGTH);
    const kinds = new Set(qs.map((q) => q.id.split(":")[1]));
    expect(kinds).toEqual(new Set(["picture", "scenario", "meaning"]));
  });

  it("only asks about the sets themselves between acronyms", () => {
    const ids = setLevelQuestions("first-aid").map((q) => q.id);
    for (const s of getSetTopic("first-aid")!.sets.filter((x) => x.mnemonic)) expect(ids).toContain(`${s.slug}:purpose`);
    expect(ids.some((id) => id.startsWith("cpr:"))).toBe(false);
    expect(setLevelQuestions("surf-awareness")).toEqual([]);
    expect(setLevelQuestions("communication")).toEqual([]);
  });

  it("fills a topic quiz to its full length", () => {
    for (const t of SET_TOPICS) expect(topicQuestions(t.id), t.id).toHaveLength(TOPIC_QUIZ_LENGTH);
  });

  it("never asks where a term belongs", () => {
    for (const t of SET_TOPICS) for (const q of topicQuestions(t.id)) expect(q.id).not.toContain(":belongs:");
  });

  it("lists one test per set plus a mixed one", () => {
    const hrefs = getTopic("surf-awareness").exercises.map((e) => e.href);
    expect(hrefs).toContain("/test/surf-awareness/types-of-waves");
    expect(hrefs).toContain("/test/surf-awareness/mixed");
  });
});

describe("set results", () => {
  it("can be saved", () => {
    expect(parseDrillResult({ drill: "set_quiz", item: "types-of-waves", score: 9, total: 10 })).not.toBeNull();
    expect(parseDrillResult({ drill: "topic_mixed", item: "surf-awareness", score: 9, total: 12 })).not.toBeNull();
  });

  it("passes a set at 90%", () => {
    const p = setProgress([r("set_quiz", "types-of-waves", 9, 10), r("set_quiz", "wave-words", 8, 10)], "surf-awareness");
    expect(p.map((x) => [x.slug, x.tried, x.passed])).toEqual([
      ["types-of-waves", true, true],
      ["signs-of-a-rip", false, false],
      ["wave-words", true, false],
    ]);
  });

  it("shows under its topic in history", () => {
    expect(describeResult("set_quiz", "signs-of-a-rip")).toEqual({ area: "surf-awareness", title: "Signs of a rip" });
    expect(describeResult("topic_mixed", "surf-awareness")).toEqual({ area: "surf-awareness", title: "Mixed quiz" });
    expect(describeResult("radio_prowords", null)).toEqual({ area: "communication", title: "Prowords" });
  });
});
