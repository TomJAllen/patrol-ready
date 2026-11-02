import { describe, it, expect } from "vitest";
import { ALL_SETS, SET_TOPICS, getSet } from "@/content/sets";
import { setQuestions, setLevelQuestions, topicQuestions, SET_QUIZ_LENGTH } from "@/lib/setQuiz";
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
        const values = s.items.map((i) => i[field]);
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
      if (s.questions.includes("odd-one-out")) expect(s.decoys?.length, s.slug).toBeGreaterThan(0);
      if (s.questions.includes("picture")) expect(s.items.some((i) => i.visual), s.slug).toBe(true);
      if (s.questions.includes("next")) expect(s.ordered, s.slug).toBe(true);
      // Decoys must not be real items
      for (const d of s.decoys ?? []) expect(s.items.map((i) => i.term), s.slug).not.toContain(d);
    }
  });
});

describe("set quizzes", () => {
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

  it("asks what each set is for in a topic quiz", () => {
    const ids = setLevelQuestions("surf-awareness").map((q) => q.id);
    for (const s of SET_TOPICS[0].sets) expect(ids).toContain(`${s.slug}:purpose`);
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
    expect(describeResult("radio_prowords", null)).toEqual({ area: "radio", title: "Prowords" });
  });
});
