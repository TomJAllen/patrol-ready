// Progress through each topic, from /api/stats. Shared by the dashboard and the
// profile so they always agree.

import { masteryOf, correctInARow, levelFor, type Level, type Mastery } from "@/lib/progress";
import { progressForSet, type LatestResult } from "@/lib/drillResults";
import { SET_TOPICS, testHref, type SetTopicId } from "@/content/sets";

export interface SignalStat {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  stats: { totalAttempts: number; correctAttempts: number; accuracy: number };
}

export interface StatsResponse {
  overall: { totalAttempts: number };
  signalStats?: SignalStat[];
  recentResults?: Record<string, boolean[]>;
  practiceTimes?: string[];
  drillResults?: LatestResult[];
}

export interface SignalProgress extends SignalStat {
  mastery: Mastery;
  inARow: number;
}

const ORDER: Record<Mastery, number> = { learning: 0, new: 1, mastered: 2 };

export function signalProgress(stats: StatsResponse): SignalProgress[] {
  return (stats.signalStats ?? []).map((s) => {
    const recent = stats.recentResults?.[s.id] ?? [];
    // Practised, but not recently enough to be in the latest results
    const mastery = recent.length === 0 && s.stats.totalAttempts > 0 ? "learning" : masteryOf(recent);
    return { ...s, mastery, inARow: correctInARow(recent) };
  });
}

// What to practise next: closest to slipping first (learning, lowest accuracy), then new ones
export function nextUpSignals(signals: SignalProgress[], count = 3): SignalProgress[] {
  return [...signals]
    .filter((s) => s.mastery !== "mastered")
    .sort((a, b) => ORDER[a.mastery] - ORDER[b.mastery] || a.stats.accuracy - b.stats.accuracy)
    .slice(0, count);
}

export type SegmentState = "done" | "started" | "none";

export interface TopicArea {
  id: SetTopicId;
  label: string;
  done: number; // sets passed
  total: number;
  tried: boolean;
  level: Level;
  states: SegmentState[]; // one per set
  next: { text: string; href: string; cta: string } | null;
}

// One summary per topic, one segment per set. Hand signals count as passed once
// every signal is mastered.
export function topicAreas(stats: StatsResponse | null): TopicArea[] {
  const signals = stats ? signalProgress(stats) : [];
  const hasAttempts = !!stats && stats.overall.totalAttempts > 0;
  const allMastered = signals.length > 0 && signals.every((s) => s.mastery === "mastered");
  const next3 = nextUpSignals(signals);
  const latest = stats?.drillResults ?? [];

  return SET_TOPICS.map((t) => {
    const sets = t.sets.map((set) => {
      if (set.slug === "hand-signals") return { set, passed: allMastered, tried: hasAttempts };
      const p = progressForSet(set, latest);
      return { set, passed: p.passed, tried: p.tried };
    });
    const nextSet = sets.find((x) => x.tried && !x.passed) ?? sets.find((x) => !x.passed);
    const next = !nextSet
      ? null
      : nextSet.set.slug === "hand-signals"
        ? hasAttempts
          ? { text: next3.map((n) => n.name).join(", "), href: "/study/identify?start=quick", cta: "Keep going with signals" }
          : { text: "Name your first signal", href: "/study/identify?start=quick", cta: "Start with signals" }
        : { text: nextSet.set.title, href: testHref(nextSet.set), cta: `Test yourself: ${nextSet.set.title}` };
    const done = sets.filter((x) => x.passed).length;
    const tried = sets.some((x) => x.tried);
    return {
      id: t.id,
      label: t.title,
      done,
      total: sets.length,
      tried,
      level: levelFor(done, sets.length, tried),
      states: sets.map((x) => (x.passed ? "done" : x.tried ? "started" : "none")),
      next,
    };
  });
}
