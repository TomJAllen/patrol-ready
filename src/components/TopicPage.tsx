"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getSetTopic, setTests, learnHref, quickQuizHref, QUICK_QUIZ_SIZES, type SetTopicId } from "@/content/sets";
import Breadcrumbs from "@/components/Breadcrumbs";
import TopicIcon from "@/components/TopicIcon";
import { setRecord, PASS_MARK, type LatestResult } from "@/lib/drillResults";
import { MASTERY_STREAK } from "@/lib/progress";
import { topicAreas, type StatsResponse, type SegmentState } from "@/lib/topicProgress";

// "✓ Passed" or "Started" on a set card, once you've had a go
function SetStatus({ state }: { state?: SegmentState }) {
  if (!state || state === "none") return null;
  return state === "done" ? (
    <span className="shrink-0 rounded border-2 border-ink bg-correct px-2 py-0.5 text-xs font-bold text-white">✓ Passed</span>
  ) : (
    <span className="shrink-0 rounded border-2 border-ink bg-secondary px-2 py-0.5 text-xs font-bold text-ink">Started</span>
  );
}

const shortDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }) : "—";

// One topic: a quick quiz, its sets (each with Learn and its tests) and, when
// signed in, a table of where you're up to
export default function TopicPage({ topic }: { topic: SetTopicId }) {
  const t = getSetTopic(topic)!;
  const { status } = useSession();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [results, setResults] = useState<LatestResult[] | null>(null);
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then(setStats)
      .catch(() => {});
    fetch("/api/drill-results?limit=200")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setResults(Array.isArray(d) ? d : null))
      .catch(() => {});
  }, [status]);
  const area = stats ? topicAreas(stats).find((a) => a.id === topic) : undefined;

  return (
    <div className="space-y-8 pb-12">
      <Breadcrumbs trail={[{ href: "/topics", label: "Topics" }]} />
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <TopicIcon topic={t.id} size="lg" />
          <h1 className="font-display text-4xl font-extrabold uppercase leading-none text-ink">{t.title}</h1>
        </div>
        <p className="text-stone-700">
          {t.blurb} Each set has a <strong>Learn</strong> page to read, then a quiz to test yourself.
        </p>
      </header>

      <section className="rounded-lg border-2 border-ink bg-secondary p-4 shadow-[3px_3px_0_#1C1917]">
        <h2 className="font-display text-2xl font-bold text-ink">Quick quiz</h2>
        <p className="mt-1 text-sm text-ink">Random questions from every set in {t.title.toLowerCase()}. How many?</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_QUIZ_SIZES.map((n, i) => (
            <Link key={n} href={quickQuizHref(t.id, n)} className={`${i === 1 ? "btn-primary" : "btn-outline"} px-4 py-2`}>
              {n} questions
            </Link>
          ))}
        </div>
      </section>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {t.sets.map((set, i) => (
          <li key={set.slug} className="flex flex-col rounded-lg border-2 border-ink bg-white p-4 shadow-[3px_3px_0_#1C1917]">
            <div className="flex items-start justify-between gap-2">
              <p className="font-display text-2xl font-bold leading-tight text-ink">{set.title}</p>
              <SetStatus state={area?.states[i]} />
            </div>
            <p className="mt-1 flex-1 text-sm text-stone-700">{set.purpose}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={learnHref(set)} className="btn-outline px-3 py-1.5 text-sm">
                Learn
              </Link>
              {setTests(set).map((test) => (
                <Link key={test.href} href={test.href} title={test.description} className="btn-primary px-3 py-1.5 text-sm">
                  {test.label}
                </Link>
              ))}
            </div>
          </li>
        ))}
      </ul>

      {area?.tried && (
        <section aria-labelledby="where-youre-up-to" className="space-y-2">
          <h2 id="where-youre-up-to" className="font-display text-2xl font-extrabold uppercase text-ink">
            Where you&apos;re up to
          </h2>
          <div className="overflow-x-auto rounded-lg border-2 border-ink bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b-2 border-ink bg-stone-50 font-display text-base uppercase text-ink">
                <tr>
                  <th className="px-3 py-2">Set</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Best</th>
                  <th className="px-3 py-2">Passed on</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {t.sets.map((set, i) => {
                  const state = area.states[i];
                  const rec = results && set.slug !== "hand-signals" ? setRecord(set, results) : null;
                  return (
                    <tr key={set.slug}>
                      <td className="px-3 py-2 font-semibold text-ink">{set.title}</td>
                      <td className="px-3 py-2">
                        {state === "none" ? <span className="text-stone-500">Not tried</span> : <SetStatus state={state} />}
                      </td>
                      <td className="px-3 py-2 text-stone-700">{rec?.best != null ? `${Math.round(rec.best * 100)}%` : "—"}</td>
                      <td className="px-3 py-2 text-stone-700">{shortDate(rec?.firstPassed ?? null)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-stone-600">
            A set is passed at {Math.round(PASS_MARK * 100)}% or more on its quiz (or a radio call built with no mistakes).
            Hand signals are passed once every signal is mastered: your last {MASTERY_STREAK} tries at it right. This shows
            your progress in this app only; whether you&apos;re ready to patrol is up to your club&apos;s training.
          </p>
        </section>
      )}
    </div>
  );
}
