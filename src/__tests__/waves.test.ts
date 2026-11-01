import { describe, it, expect } from "vitest";
import { WAVE_DRILLS, WAVE_TERMS, WAVE_TYPE_QUESTIONS, WAVE_TYPES } from "@/content/waves";
import { waveTermQuestions, waveTypeQuestions } from "@/components/drills/WavesPractice";
import { describeResult, parseDrillResult, waveProgress, type LatestResult } from "@/lib/drillResults";
import { getTopic } from "@/content/topics";

const r = (drill: string, score: number, total: number): LatestResult => ({
  drill,
  item: null,
  score,
  total,
  mistakes: total - score,
  at: "2026-11-02T00:00:00Z",
});

describe("waves content", () => {
  it("has the three breaking wave types", () => {
    expect(WAVE_TYPES.map((w) => w.id)).toEqual(["spilling", "plunging", "surging"]);
  });

  it("has unique terms and meanings, so each question has one right answer", () => {
    expect(new Set(WAVE_TERMS.map((t) => t.term)).size).toBe(WAVE_TERMS.length);
    expect(new Set(WAVE_TERMS.map((t) => t.meaning)).size).toBe(WAVE_TERMS.length);
  });

  it("asks about every wave type", () => {
    const answered = new Set(WAVE_TYPE_QUESTIONS.map((q) => q.answer));
    for (const w of WAVE_TYPES) expect(answered.has(w.id), w.id).toBe(true);
  });

  it("builds questions whose answer is always an option", () => {
    for (const q of [...waveTypeQuestions(), ...waveTermQuestions()]) {
      expect(q.options, q.id).toContain(q.answer);
      expect(new Set(q.options).size, q.id).toBe(q.options.length);
    }
    expect(waveTypeQuestions()).toHaveLength(WAVE_TYPE_QUESTIONS.length + WAVE_TYPES.length);
  });

  it("lists every drill as a live test", () => {
    const hrefs = getTopic("waves").exercises.map((e) => e.href);
    for (const d of WAVE_DRILLS) expect(hrefs).toContain(`/test/waves/${d}`);
  });
});

describe("waves results", () => {
  it("can be saved", () => {
    expect(parseDrillResult({ drill: "waves_types", item: null, score: 10, total: 13 })).not.toBeNull();
    expect(parseDrillResult({ drill: "waves_terms", item: null, score: 13, total: 13 })).not.toBeNull();
  });

  it("passes at 90%", () => {
    const p = waveProgress([r("waves_types", 12, 13), r("waves_terms", 10, 13)]);
    expect(p).toEqual([
      { id: "types", tried: true, passed: true },
      { id: "terms", tried: true, passed: false },
    ]);
  });

  it("shows under Waves in history", () => {
    expect(describeResult("waves_types", null)).toEqual({ area: "waves", title: "Wave types" });
    expect(describeResult("radio_prowords", null)).toEqual({ area: "radio", title: "Prowords" });
  });
});
