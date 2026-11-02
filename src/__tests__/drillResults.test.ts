import { describe, it, expect } from "vitest";
import { parseDrillResult, latestResults, progressForSet, type LatestResult } from "@/lib/drillResults";
import { findSet } from "@/content/sets";

const r = (drill: string, item: string | null, score: number, total: number, mistakes = total - score): LatestResult => ({
  drill,
  item,
  score,
  total,
  mistakes,
  at: "2026-10-20T00:00:00Z",
});

describe("saving test results", () => {
  it("accepts a valid result", () => {
    expect(parseDrillResult({ drill: "mnemonic_quiz", item: "sample", score: 5, total: 6, mistakes: 1 })).toEqual({
      drill: "mnemonic_quiz",
      item: "sample",
      score: 5,
      total: 6,
      mistakes: 1,
    });
    expect(parseDrillResult({ drill: "radio_spell", item: null, score: 6, total: 6 })).not.toBeNull();
  });

  it("rejects anything odd", () => {
    for (const bad of [
      null,
      "x",
      { drill: "hack", score: 1, total: 1 },
      { drill: "radio_spell", score: 7, total: 6 },
      { drill: "radio_spell", score: 1, total: 0 },
      { drill: "radio_spell", score: 1.5, total: 2 },
      { drill: "radio_spell", score: -1, total: 2 },
      { drill: "mnemonic_quiz", item: "<script>", score: 1, total: 2 },
      { drill: "mnemonic_quiz", item: "x".repeat(41), score: 1, total: 2 },
    ]) {
      expect(parseDrillResult(bad)).toBeNull();
    }
  });

  it("keeps only the newest result per test and item", () => {
    const out = latestResults([r("mnemonic_quiz", "sample", 6, 6), r("mnemonic_quiz", "sample", 1, 6), r("mnemonic_quiz", "fast", 2, 4)]);
    expect(out.map((x) => `${x.item}:${x.score}`)).toEqual(["sample:6", "fast:2"]);
  });
});

describe("older results still count towards sets", () => {
  const get = (slug: string, latest: LatestResult[]) => progressForSet(findSet(slug)!, latest);

  it("passes an acronym set with a perfect quiz, from before or after sets", () => {
    expect(get("sample", []).tried).toBe(false);
    expect(get("sample", [r("mnemonic_quiz", "sample", 5, 6)])).toMatchObject({ tried: true, passed: false });
    expect(get("sample", [r("mnemonic_quiz", "sample", 6, 6)]).passed).toBe(true);
    expect(get("sample", [r("set_quiz", "sample", 9, 10)]).passed).toBe(true);
    expect(get("sample", [r("mnemonic_quiz", "imist-ambo", 9, 9)]).tried).toBe(false);
  });

  it("passes radio sets at 90%, or a call built with no mistakes", () => {
    expect(get("phonetic-alphabet", [r("radio_spell", null, 5, 6)]).passed).toBe(false);
    expect(get("phonetic-alphabet", [r("radio_spell", null, 6, 6)]).passed).toBe(true);
    expect(get("prowords", [r("radio_prowords", null, 11, 12)]).passed).toBe(true);
    expect(get("radio-calls", [r("radio_build_call", "radio-check", 6, 6, 2)])).toMatchObject({ tried: true, passed: false });
    expect(get("radio-calls", [r("radio_build_call", "radio-check", 6, 6, 2), r("radio_build_call", "emergency", 7, 7, 0)]).passed).toBe(true);
  });
});
