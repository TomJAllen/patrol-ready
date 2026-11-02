"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { correctInARow, masteryOf, practiceStreak, levelFor, LEVEL_LABEL, MASTERY_STREAK, type Level, type Mastery } from "@/lib/progress";
import { progressForSet, PASS_MARK, type LatestResult } from "@/lib/drillResults";
import { SET_TOPICS, testHref } from "@/content/sets";
import { TOPICS } from "@/content/topics";
import IdeasCard from "@/components/IdeasCard";
import TopicIcon from "@/components/TopicIcon";
import { track } from "@/lib/analytics";
import { dailyDoneHere, type DailyResult } from "@/lib/recordDrill";
import { dailyKey } from "@/lib/daily";

interface SignalStat {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  stats: { totalAttempts: number; correctAttempts: number; accuracy: number };
}

interface StatsResponse {
  overall: { totalAttempts: number };
  signalStats?: SignalStat[];
  recentResults?: Record<string, boolean[]>;
  practiceTimes?: string[];
  drillResults?: LatestResult[];
}

const LEVEL_STYLE: Record<Level, string> = {
  "not-started": "border-dashed border-stone-400 text-stone-600 bg-white",
  learning: "border-ink bg-secondary text-ink",
  ready: "border-correct bg-green-50 text-correct",
  "patrol-ready": "border-ink bg-correct text-white",
};


// A row of segments, one per item: green done, yellow started, white not yet
function Segments({ states, label }: { states: ("done" | "started" | "none")[]; label: string }) {
  return (
    <div className="flex gap-1" role="img" aria-label={label}>
      {states.map((st, i) => (
        <span
          key={i}
          className={`h-3 flex-1 rounded-sm border border-ink ${
            st === "done" ? "bg-correct" : st === "started" ? "bg-secondary" : "bg-white"
          }`}
        />
      ))}
    </div>
  );
}


interface SignalProgress extends SignalStat {
  mastery: Mastery;
  inARow: number;
}

const ORDER: Record<Mastery, number> = { learning: 0, new: 1, mastered: 2 };

function progressFor(stats: StatsResponse): SignalProgress[] {
  return (stats.signalStats ?? []).map((s) => {
    const recent = stats.recentResults?.[s.id] ?? [];
    // Practised, but not recently enough to be in the latest results
    const mastery = recent.length === 0 && s.stats.totalAttempts > 0 ? "learning" : masteryOf(recent);
    return { ...s, mastery, inARow: correctInARow(recent) };
  });
}

// What to practise next: closest to slipping first (learning, lowest accuracy), then new ones
function nextUp(signals: SignalProgress[], count = 3): SignalProgress[] {
  return [...signals]
    .filter((s) => s.mastery !== "mastered")
    .sort((a, b) => ORDER[a.mastery] - ORDER[b.mastery] || a.stats.accuracy - b.stats.accuracy)
    .slice(0, count);
}

function SignalTile({ s }: { s: SignalProgress }) {
  const status =
    s.mastery === "mastered" ? "Mastered" : s.mastery === "new" ? "Not tried" : `${s.inARow} of ${MASTERY_STREAK} in a row`;
  return (
    <li
      className={`flex flex-col rounded-md border-2 p-2 text-center ${
        s.mastery === "mastered"
          ? "border-correct bg-green-50"
          : s.mastery === "learning"
            ? "border-ink bg-white"
            : "border-dashed border-stone-300 bg-white opacity-70"
      }`}
    >
      <div className="relative mx-auto aspect-square w-full max-w-[5.5rem]">
        <Image src={s.imageUrl} alt="" fill sizes="88px" className="object-contain mix-blend-multiply" />
      </div>
      <span className="mt-1 text-xs font-semibold leading-tight text-ink">{s.name}</span>
      <span
        className={`mt-1 text-[11px] font-bold uppercase tracking-wide ${
          s.mastery === "mastered" ? "text-correct" : s.mastery === "learning" ? "text-primary" : "text-stone-500"
        }`}
      >
        {s.mastery === "mastered" && "✓ "}
        {status}
      </span>
    </li>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  // Today's practice done in this browser (shown at once, before the account catches up)
  const [dailyHere, setDailyHere] = useState<DailyResult | null>(null);
  useEffect(() => setDailyHere(dailyDoneHere()), []);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then(setStats)
      .catch((error) => console.error("Failed to fetch stats:", error))
      .finally(() => setLoading(false));
  }, []);

  const firstName = session?.user?.name?.split(" ")[0];
  const hasAttempts = !!stats && stats.overall.totalAttempts > 0;
  const signals = stats ? progressFor(stats) : [];
  const mastered = signals.filter((s) => s.mastery === "mastered").length;
  const next3 = nextUp(signals);
  const streak = practiceStreak(stats?.practiceTimes ?? []);
  const allMastered = signals.length > 0 && mastered === signals.length;
  const tiles = [...signals].sort((a, b) => ORDER[a.mastery] - ORDER[b.mastery] || a.name.localeCompare(b.name));

  const latest = stats?.drillResults ?? [];
  const savedDaily = latest.find((r) => r.drill === "daily_mix" && dailyKey(new Date(r.at)) === dailyKey());
  const dailyToday = savedDaily ? { score: savedDaily.score, total: savedDaily.total } : dailyHere;
  const anyActivity = hasAttempts || latest.length > 0;

  // One summary row per topic, one segment per set, and a single "next up":
  // the topic you're furthest behind in. Hand signals count as passed once
  // every signal is mastered.
  type State = "done" | "started" | "none";
  const areas = SET_TOPICS.map((t) => {
    const sets = t.sets.map((set) => {
      if (set.slug === "hand-signals") {
        return { set, passed: allMastered, tried: hasAttempts };
      }
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
    return {
      id: t.id,
      label: t.title,
      done: sets.filter((x) => x.passed).length,
      total: sets.length,
      unit: "sets passed",
      tried: sets.some((x) => x.tried),
      states: sets.map((x) => (x.passed ? "done" : x.tried ? "started" : "none")) as State[],
      next,
    };
  });
  const focus = [...areas].filter((a) => a.next).sort((a, b) => a.done / a.total - b.done / b.total)[0];

  // Anonymous "level_reached" when an area moves up a level since the last visit
  // on this device. The first visit just records where you are.
  const levelKey = areas.map((a) => `${a.id}:${levelFor(a.done, a.total, a.tried)}`).join(",");
  useEffect(() => {
    if (loading || !stats) return;
    const RANK: Record<Level, number> = { "not-started": 0, learning: 1, ready: 2, "patrol-ready": 3 };
    const now = Object.fromEntries(levelKey.split(",").map((p) => p.split(":"))) as Record<string, Level>;
    try {
      const before = JSON.parse(localStorage.getItem("ss-levels") ?? "null") as Record<string, Level> | null;
      if (before) {
        for (const [area, level] of Object.entries(now)) {
          if (before[area] && RANK[level] > RANK[before[area]]) track("level_reached", { area, level });
        }
      }
      localStorage.setItem("ss-levels", JSON.stringify(now));
    } catch {
      /* storage unavailable */
    }
  }, [loading, stats, levelKey]);

  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-1">
        <h1 className="font-display text-4xl font-extrabold uppercase text-ink">
          {firstName ? `G'day, ${firstName}` : "G'day"}
        </h1>
        {!loading && anyActivity && (
          <p className="font-semibold text-ink">
            {streak.days === 0
              ? "Practise today to start a streak."
              : streak.doneToday
                ? `${streak.days}-day streak. Nice work today.`
                : `${streak.days}-day streak. Practise today to keep it going.`}
          </p>
        )}
      </header>

      {loading ? (
        <div className="card flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <>
          {/* Today: one thing to do */}
          {dailyToday ? (
            <section className="card flex flex-wrap items-center gap-x-4 gap-y-3 border-correct">
              <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-correct text-xl font-bold text-white">
                ✓
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-2xl font-extrabold uppercase leading-none text-ink">Today&apos;s practice done</p>
                <p className="mt-1 text-ink">
                  You got <strong>{dailyToday.score}/{dailyToday.total}</strong>
                  {dailyToday.score === dailyToday.total ? ". Perfect." : "."} New set at midnight.
                </p>
              </div>
              <div className="flex w-full flex-wrap gap-x-4 gap-y-1 text-sm sm:w-auto">
                {focus?.next && (
                  <Link
                    href={focus.next.href}
                    onClick={() => track("dashboard_cta", { target: "area_after_daily", focus: focus.id })}
                    className="font-semibold text-primary hover:underline"
                  >
                    Keep going: {focus.label.toLowerCase()} →
                  </Link>
                )}
                <Link
                  href="/test/daily"
                  onClick={() => track("dashboard_cta", { target: "daily_answers" })}
                  className="font-semibold text-stone-700 hover:underline"
                >
                  See today&apos;s answers
                </Link>
              </div>
            </section>
          ) : (
          <section className="card-highlight space-y-5">
            {focus?.next ? (
              <div className="space-y-3">
                <p className="text-sm font-bold uppercase tracking-widest text-primary">Today</p>
                <p className="font-display text-3xl font-extrabold uppercase leading-tight text-ink">
                  {anyActivity ? focus.label : "Start with the signals"}
                </p>
                <p className="text-ink">{focus.next.text}</p>
                <Link
                  href="/test/daily"
                  onClick={() => track("dashboard_cta", { target: "daily", focus: focus.id })}
                  className="btn-primary w-full sm:w-auto"
                >
                  Start today&apos;s practice
                </Link>
                <p className="text-sm text-stone-600">
                  Five quick questions, one from each topic plus a wildcard.{" "}
                  <Link
                    href={focus.next.href}
                    onClick={() => track("dashboard_cta", { target: "area", focus: focus.id })}
                    className="font-semibold text-primary hover:underline"
                  >
                    Or go straight to {focus.label.toLowerCase()}
                  </Link>
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="font-display text-3xl font-extrabold uppercase text-ink">All done in here</p>
                <p className="text-ink">
                  You&apos;ve mastered everything in Patrol Ready. Keep it sharp with a few questions a day, and keep
                  training with your club.
                </p>
                <Link href="/test/daily" className="btn-primary w-full sm:w-auto">
                  Start today&apos;s practice
                </Link>
              </div>
            )}
          </section>
          )}
        </>
      )}

      {/* Straight into any area. Shown while stats load, since it doesn't need them */}
      <section aria-labelledby="topics" className="space-y-3">
        <div>
          <h2 id="topics" className="font-display text-2xl font-extrabold uppercase text-ink">
            Your topics
          </h2>
          <p className="text-sm text-stone-700">
            Everything is grouped into four topics. Learn reads you through it; Test quizzes you on it.
          </p>
        </div>
        <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {TOPICS.map((t) => {
            const a = areas.find((x) => x.id === t.id);
            const level = a && !loading ? levelFor(a.done, a.total, a.tried) : null;
            return (
              <li key={t.id} className="card space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <TopicIcon topic={t.id} />
                  <div className="flex-1">
                    <p className="font-display text-2xl font-extrabold uppercase leading-none text-ink">{t.title}</p>
                    <p className="mt-1 text-sm text-stone-700">{t.blurb}</p>
                  </div>
                  {level && level !== "not-started" && (
                    <span className={`shrink-0 rounded border-2 px-2 py-0.5 text-xs font-bold leading-tight ${LEVEL_STYLE[level]}`}>
                      {level === "patrol-ready" && "✓ "}
                      {LEVEL_LABEL[level]}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={t.learnHref}
                    onClick={() => track("dashboard_cta", { target: "learn", focus: t.id })}
                    className="btn-outline w-full py-2.5"
                  >
                    Learn
                  </Link>
                  <Link
                    href={t.testHref}
                    onClick={() => track("dashboard_cta", { target: "test", focus: t.id })}
                    className="btn-primary w-full py-2.5"
                  >
                    Test
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* The detail, for anyone who wants it */}
      {!loading && anyActivity && (
        <details className="group">
          <summary className="cursor-pointer font-display text-xl font-bold uppercase text-ink">
            Show details
          </summary>
          <div className="mt-4 space-y-6">
            <ul className="space-y-4">
              {areas.map((a) => (
                <li key={a.id} className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-bold text-ink">{a.label}</span>
                    <span className="text-sm text-stone-700">
                      {a.done} of {a.total} {a.unit}
                    </span>
                  </div>
                  <Segments states={a.states} label={`${a.label}: ${a.done} of ${a.total} ${a.unit}`} />
                </li>
              ))}
            </ul>
            {hasAttempts && (
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
                {tiles.map((t) => (
                  <SignalTile key={t.id} s={t} />
                ))}
              </ul>
            )}
            <p className="text-xs text-stone-600">
              Levels: In training once you&apos;ve started, Shadow patrolling at three quarters, Patrol-ready when
              everything is done. Each topic is made of sets: a set is passed at {Math.round(PASS_MARK * 100)}% or more on its
              quiz (or a radio call built with no mistakes), and Hand signals once every signal is mastered, which is when
              your last {MASTERY_STREAK} tries at it were right. Levels show your progress
              in this app only. Whether you&apos;re ready to patrol is up to your club&apos;s training and assessment.{" "}
              <Link href="/history" className="font-semibold text-primary hover:underline">
                Signal history
              </Link>
            </p>
          </div>
        </details>
      )}

      <IdeasCard where="dashboard" />
    </div>
  );
}
