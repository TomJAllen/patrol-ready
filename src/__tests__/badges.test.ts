import { describe, it, expect } from "vitest";
import { badges, type SavedResult } from "@/lib/badges";
import { longestStreak } from "@/lib/progress";
import { topicAreas } from "@/lib/topicProgress";

const at = (d: string) => new Date(`${d}T03:00:00`).toISOString();
const res = (drill: string, item: string | null, score: number, total: number, day = "2026-11-01", mistakes = total - score): SavedResult => ({
  drill,
  item,
  score,
  total,
  mistakes,
  at: at(day),
});

const input = (over: Partial<Parameters<typeof badges>[0]> = {}) => ({
  areas: topicAreas(null),
  results: [] as SavedResult[],
  practiceTimes: [] as string[],
  signalsMastered: 0,
  signalsTotal: 14,
  performSessions: 0,
  ...over,
});
const get = (list: ReturnType<typeof badges>, id: string) => list.find((b) => b.id === id)!;

describe("longest streak", () => {
  it("counts consecutive days", () => {
    expect(longestStreak([])).toBe(0);
    expect(longestStreak([at("2026-11-01"), at("2026-11-01")])).toBe(1);
    expect(longestStreak(["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-05", "2026-10-06"].map(at))).toBe(3);
  });
});

describe("badges", () => {
  it("starts with nothing earned", () => {
    expect(badges(input()).filter((b) => b.earned)).toHaveLength(0);
  });

  it("has unique ids", () => {
    const ids = badges(input()).map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("earns the first badge for any finished test", () => {
    expect(get(badges(input({ results: [res("set_quiz", "cpr", 3, 10)] })), "first").earned).toBe(true);
  });

  it("earns streak badges from the best run", () => {
    const times = ["2026-10-01", "2026-10-02", "2026-10-03"].map(at);
    const list = badges(input({ practiceTimes: times }), new Date("2026-11-01T03:00:00"));
    expect(get(list, "streak-3").earned).toBe(true);
    expect(get(list, "streak-7")).toMatchObject({ earned: false, progress: { done: 3, total: 7 } });
  });

  it("counts perfect daily practice and daily days", () => {
    const dailies = ["2026-11-01", "2026-11-02", "2026-11-03", "2026-11-04"].map((d) => res("daily_mix", null, 4, 5, d));
    let list = badges(input({ results: dailies }));
    expect(get(list, "daily-perfect").earned).toBe(false);
    expect(get(list, "daily-5").progress).toEqual({ done: 4, total: 5 });
    list = badges(input({ results: [...dailies, res("daily_mix", null, 5, 5, "2026-11-05")] }));
    expect(get(list, "daily-perfect").earned).toBe(true);
    expect(get(list, "daily-5").earned).toBe(true);
  });

  it("counts a match round with no mistakes as perfect", () => {
    const results = Array.from({ length: 10 }, () => res("mnemonic_match", "sample", 6, 6, "2026-11-01", 0));
    expect(get(badges(input({ results })), "perfect-10").earned).toBe(true);
  });

  it("earns topic badges from levels", () => {
    const stats = {
      overall: { totalAttempts: 0 },
      drillResults: ["types-of-waves", "signs-of-a-rip", "wave-words"].map((item) => ({ ...res("set_quiz", item, 10, 10) })),
    };
    const list = badges(input({ areas: topicAreas(stats) }));
    expect(get(list, "topic-surf-awareness").earned).toBe(true);
    expect(get(list, "topic-first-aid").earned).toBe(false);
    expect(get(list, "all-rounder").progress).toEqual({ done: 1, total: 4 });
  });
});
