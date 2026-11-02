"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { practiceStreak, type Level } from "@/lib/progress";
import { topicAreas, type StatsResponse } from "@/lib/topicProgress";
import { TOPICS } from "@/content/topics";
import IdeasCard from "@/components/IdeasCard";
import TopicIcon from "@/components/TopicIcon";
import { LevelBadge, Segments } from "@/components/ProgressBits";
import { track } from "@/lib/analytics";
import { dailyDoneHere, type DailyResult } from "@/lib/recordDrill";
import { dailyKey } from "@/lib/daily";

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
  const streak = practiceStreak(stats?.practiceTimes ?? []);
  const latest = stats?.drillResults ?? [];
  const savedDaily = latest.find((r) => r.drill === "daily_mix" && dailyKey(new Date(r.at)) === dailyKey());
  const dailyToday = savedDaily ? { score: savedDaily.score, total: savedDaily.total } : dailyHere;
  const anyActivity = hasAttempts || latest.length > 0;

  // One summary per topic, and a single "next up": the topic you're furthest behind in
  const areas = topicAreas(stats);
  const focus = [...areas].filter((a) => a.next).sort((a, b) => a.done / a.total - b.done / b.total)[0];

  // Anonymous "level_reached" when an area moves up a level since the last visit
  // on this device. The first visit just records where you are.
  const levelKey = areas.map((a) => `${a.id}:${a.level}`).join(",");
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
                <p className="font-display text-3xl font-extrabold uppercase leading-tight text-ink">Today&apos;s practice</p>
                <p className="text-ink">Five quick questions from across every topic. The same for everyone, new each day.</p>
                <Link
                  href="/test/daily"
                  onClick={() => track("dashboard_cta", { target: "daily", focus: focus.id })}
                  className="btn-primary w-full sm:w-auto"
                >
                  Start today&apos;s practice
                </Link>
                <p className="text-sm text-stone-600">
                  {anyActivity ? "Or pick up where you left off: " : "Or start with "}
                  <Link
                    href={focus.next.href}
                    onClick={() => track("dashboard_cta", { target: "area", focus: focus.id })}
                    className="font-semibold text-primary hover:underline"
                  >
                    {anyActivity ? `${focus.label}, ${focus.next.text}` : "the hand signals"} →
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
            const a = areas.find((x) => x.id === t.id)!;
            const level = loading ? null : a.level;
            return (
              <li key={t.id} className="card flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <TopicIcon topic={t.id} />
                  {level && level !== "not-started" && <LevelBadge level={level} />}
                </div>
                <div className="flex-1">
                  <p className="font-display text-2xl font-extrabold uppercase leading-none text-ink">{t.title}</p>
                  <p className="mt-1 text-sm text-stone-700">{t.blurb}</p>
                </div>
                {!loading && anyActivity && (
                  <div className="space-y-1">
                    <Segments states={a.states} label={`${a.label}: ${a.done} of ${a.total} sets passed`} />
                    <p className="text-xs font-semibold text-stone-600">
                      {a.done} of {a.total} sets passed
                    </p>
                  </div>
                )}
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

      <IdeasCard where="dashboard" />
    </div>
  );
}
