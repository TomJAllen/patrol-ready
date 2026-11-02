"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getSetTopic, setTests, learnHref, type SetTopicId } from "@/content/sets";
import Breadcrumbs from "@/components/Breadcrumbs";
import TopicIcon from "@/components/TopicIcon";
import { LevelBadge, Segments } from "@/components/ProgressBits";
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

// The Test page for a topic: one card per set with its tests, then the mixed quiz
export default function TopicTests({ topic }: { topic: SetTopicId }) {
  const t = getSetTopic(topic)!;
  // Your progress, when signed in
  const { status } = useSession();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then(setStats)
      .catch(() => {});
  }, [status]);
  const area = stats ? topicAreas(stats).find((a) => a.id === topic) : undefined;
  const showProgress = !!area && area.tried;

  return (
    <div className="space-y-8 pb-12">
      <Breadcrumbs trail={[{ href: "/test", label: "Test" }]} />
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <TopicIcon topic={t.id} size="lg" />
          <h1 className="font-display text-4xl font-extrabold uppercase leading-none text-ink">Test your {t.title.toLowerCase()}</h1>
        </div>
        <p className="text-stone-700">
          {t.blurb} Need a refresher?{" "}
          <Link href={`/learn/${t.id}`} className="font-semibold text-primary hover:underline">
            Learn {t.title.toLowerCase()}
          </Link>
        </p>
      </header>
      <Link
        href={`/test/${t.id}/mixed`}
        className="block rounded-lg border-2 border-ink bg-secondary p-4 shadow-[3px_3px_0_#1C1917] transition-[transform,box-shadow] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
      >
        <span className="flex items-start justify-between gap-2">
          <span className="font-display text-2xl font-bold text-ink">All of {t.title.toLowerCase()} →</span>
          {showProgress && <LevelBadge level={area.level} />}
        </span>
        <span className="mt-1 block text-sm text-ink">A mix of questions from every set.</span>
        {showProgress && (
          <span className="mt-3 block space-y-1">
            <Segments states={area.states} label={`${area.done} of ${area.total} sets passed`} />
            <span className="block text-xs font-semibold text-ink">
              {area.done} of {area.total} sets passed
            </span>
          </span>
        )}
      </Link>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {t.sets.map((set, i) => (
          <li key={set.slug} className="flex flex-col rounded-lg border-2 border-ink bg-white p-4 shadow-[3px_3px_0_#1C1917]">
            <div className="flex items-start justify-between gap-2">
              <p className="font-display text-2xl font-bold leading-tight text-ink">{set.title}</p>
              <SetStatus state={area?.states[i]} />
            </div>
            <p className="mt-1 flex-1 text-sm text-stone-700">{set.purpose}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {setTests(set).map((test, i) => (
                <Link
                  key={test.href}
                  href={test.href}
                  title={test.description}
                  className={`${i === 0 ? "btn-primary" : "btn-outline"} px-3 py-1.5 text-sm`}
                >
                  {test.label}
                </Link>
              ))}
              <Link href={learnHref(set)} className="px-2 py-1.5 text-sm font-semibold text-primary hover:underline">
                Learn
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
