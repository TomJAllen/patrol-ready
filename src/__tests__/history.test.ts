import { describe, it, expect, beforeEach } from "vitest";
import { describeResult, parseDrillResult } from "@/lib/drillResults";
import { dailyDoneHere, saveDrillResult } from "@/lib/recordDrill";

describe("describeResult", () => {
  it("names each kind of result", () => {
    expect(describeResult("daily_mix", null)).toEqual({ area: "daily", title: "Daily practice" });
    expect(describeResult("signals_perform", null)).toEqual({ area: "communication", title: "Hand signals: Perform" });
    expect(describeResult("mnemonic_match", "sample")).toEqual({ area: "first-aid", title: "SAMPLE: Match" });
    expect(describeResult("mnemonic_quiz", "help")).toEqual({ area: "patrol", title: "HELP: Quiz" });
    expect(describeResult("radio_prowords", null)).toEqual({ area: "communication", title: "Prowords" });
  });
});

describe("signal sessions", () => {
  it("can be saved", () => {
    expect(parseDrillResult({ drill: "signals_identify", item: null, score: 9, total: 14, mistakes: 5 })).not.toBeNull();
  });
});

describe("today's practice in this browser", () => {
  beforeEach(() => localStorage.clear());
  it("is remembered for today only", () => {
    expect(dailyDoneHere()).toBeNull();
    saveDrillResult({ drill: "daily_mix", score: 3, total: 4 });
    expect(dailyDoneHere()).toMatchObject({ score: 3, total: 4 });
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(dailyDoneHere(tomorrow)).toBeNull();
  });
});
