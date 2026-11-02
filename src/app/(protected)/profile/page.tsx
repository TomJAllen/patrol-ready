"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import TopicIcon from "@/components/TopicIcon";
import { LevelBadge, Segments } from "@/components/ProgressBits";
import { badges, isTopicIcon, type Badge, type SavedResult } from "@/lib/badges";
import { longestStreak, practiceStreak, MASTERY_STREAK } from "@/lib/progress";
import { signalProgress, topicAreas, type StatsResponse } from "@/lib/topicProgress";
import { PASS_MARK } from "@/lib/drillResults";

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-md border-2 border-ink bg-white p-3 text-center">
      <p className="font-display text-3xl font-extrabold leading-none text-ink">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-stone-600">{label}</p>
    </div>
  );
}

function BadgeCard({ b }: { b: Badge }) {
  const topic = isTopicIcon(b.icon);
  return (
    <li
      className={`flex flex-col items-center rounded-lg border-2 p-3 text-center ${
        b.earned ? "border-ink bg-white shadow-[3px_3px_0_#1C1917]" : "border-dashed border-stone-300 bg-stone-50"
      }`}
    >
      <span className={`flex h-14 w-14 items-center justify-center ${b.earned ? "" : "opacity-40 grayscale"}`}>
        {topic ? <TopicIcon topic={topic} size="lg" /> : <span className="text-4xl" aria-hidden="true">{b.icon}</span>}
      </span>
      <span className="mt-2 font-display text-lg font-bold leading-tight text-ink">{b.title}</span>
      <span className="mt-1 text-xs text-stone-700">{b.description}</span>
      {b.earned ? (
        <span className="mt-2 text-xs font-bold uppercase tracking-wide text-correct">✓ Earned</span>
      ) : (
        b.progress && (
          <span className="mt-2 text-xs font-semibold text-stone-500">
            {b.progress.done} of {b.progress.total}
          </span>
        )
      )}
    </li>
  );
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [results, setResults] = useState<SavedResult[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats").then((r) => (r.ok ? r.json() : Promise.reject())),
      fetch("/api/drill-results?limit=200").then((r) => (r.ok ? r.json() : Promise.reject())),
    ])
      .then(([s, d]) => {
        setStats(s);
        setResults(Array.isArray(d) ? d : (d?.results ?? []));
      })
      .catch(() => setError(true));
  }, []);

  if (error) return <div className="card text-center text-ink">Couldn&apos;t load your profile. Check your connection and try again.</div>;
  if (!stats || !results) {
    return (
      <div className="card flex justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  const times = stats.practiceTimes ?? [];
  const streak = practiceStreak(times);
  const best = Math.max(longestStreak(times), streak.days);
  const areas = topicAreas(stats);
  const signals = signalProgress(stats);
  const list = badges({
    areas,
    results,
    practiceTimes: times,
    signalsMastered: signals.filter((s) => s.mastery === "mastered").length,
    signalsTotal: signals.length,
    performSessions: results.filter((r) => r.drill === "signals_perform").length,
  });
  const earned = list.filter((b) => b.earned);
  const name = session?.user?.name;

  return (
    <div className="space-y-8 pb-12">
      <section className="card-highlight space-y-4">
        <div className="flex items-center gap-4">
          <span aria-hidden="true" className="text-5xl">
            {streak.days > 0 ? "🔥" : "🌊"}
          </span>
          <div>
            {name && <p className="text-sm font-bold uppercase tracking-widest text-primary">{name}</p>}
            <p className="font-display text-3xl font-extrabold uppercase leading-none text-ink">
              {streak.days > 0 ? `${streak.days}-day streak` : "No streak yet"}
            </p>
            <p className="mt-1 text-sm text-ink">
              {streak.days === 0
                ? "Practise today to start one."
                : streak.doneToday
                  ? "You've practised today. Come back tomorrow to keep it going."
                  : "Practise today to keep it going."}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Stat value={best} label="Best streak" />
          <Stat value={earned.length} label={`Badges of ${list.length}`} />
          <Stat value={results.length >= 200 ? "200+" : results.length} label="Tests done" />
        </div>
        {streak.days === 0 && (
          <Link href="/test/daily" className="btn-primary w-full sm:w-auto">
            Start today&apos;s practice
          </Link>
        )}
      </section>

      <section aria-labelledby="badges" className="space-y-3">
        <h2 id="badges" className="font-display text-2xl font-extrabold uppercase text-ink">
          Badges
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[...earned, ...list.filter((b) => !b.earned)].map((b) => (
            <BadgeCard key={b.id} b={b} />
          ))}
        </ul>
      </section>

      <section aria-labelledby="levels" className="space-y-3">
        <h2 id="levels" className="font-display text-2xl font-extrabold uppercase text-ink">
          Your levels
        </h2>
        <ul className="space-y-3">
          {areas.map((a) => (
            <li key={a.id} className="card space-y-2 p-4">
              <div className="flex items-center gap-3">
                <TopicIcon topic={a.id} size="sm" />
                <span className="flex-1 font-bold text-ink">{a.label}</span>
                <LevelBadge level={a.level} />
              </div>
              <Segments states={a.states} label={`${a.label}: ${a.done} of ${a.total} sets passed`} />
              <p className="text-xs font-semibold text-stone-600">
                {a.done} of {a.total} sets passed
              </p>
            </li>
          ))}
        </ul>
        <p className="text-xs text-stone-600">
          A set is passed at {Math.round(PASS_MARK * 100)}% or more on its quiz (or a radio call built with no mistakes), and
          Hand signals once every signal is mastered: your last {MASTERY_STREAK} tries at it right. Streaks count any
          practice: a test, a signal session or today&apos;s practice, and your best streak looks back 60 days. Levels show your progress in this app only. Whether
          you&apos;re ready to patrol is up to your club&apos;s training and assessment.
        </p>
      </section>
    </div>
  );
}
