"use client";

import Link from "next/link";
import ChoiceDrill from "@/components/drills/ChoiceDrill";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getSet, getSetTopic, learnHref, testHref, topicHref } from "@/content/sets";
import { setQuestions, topicQuestions } from "@/lib/setQuiz";

// Quiz for one set, or a quick quiz across a whole topic when `set` is "mixed"
export default function SetQuiz({ topic: topicId, set: slug, size = 10 }: { topic: string; set: string; size?: number }) {
  const topic = getSetTopic(topicId)!;
  const mixed = slug === "mixed";
  const set = mixed ? undefined : getSet(topicId, slug)!;
  const title = mixed ? "Quick quiz" : set!.title;
  // After finishing, point to the next set in the topic
  const i = set ? topic.sets.indexOf(set) : -1;
  const next = set ? topic.sets[(i + 1) % topic.sets.length] : undefined;

  const after = (
    <div className="flex flex-col gap-2 pt-1 text-sm sm:flex-row sm:justify-center sm:gap-4">
      {next && next !== set && (
        <Link href={testHref(next)} className="font-semibold text-primary hover:underline">
          Next set: {next.title} →
        </Link>
      )}
      <Link href={topicHref(topic.id)} className="font-semibold text-stone-700 hover:underline">
        Back to {topic.title}
      </Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <Breadcrumbs trail={[{ href: "/topics", label: "Topics" }, { href: topicHref(topic.id), label: topic.title }]} />
      <header className="space-y-2">
        {mixed && <p className="text-sm font-bold uppercase tracking-widest text-primary">{topic.title}</p>}
        <h1 className="font-display text-4xl font-extrabold uppercase text-ink">{title}</h1>
        <p className="text-gray-600">
          {mixed ? (
            <>{size} random questions from every set. </>
          ) : (
            <>
              Need a refresher?{" "}
              <Link href={learnHref(set!)} className="text-primary font-semibold hover:underline">
                Learn {title}
              </Link>
            </>
          )}
        </p>
      </header>
      {mixed ? (
        <ChoiceDrill
          key={`mixed-${size}`}
          makeQuestions={() => topicQuestions(topic.id, size)}
          doneLabel={`${topic.title}: quick quiz`}
          trackAs={{ drill: "topic_mixed", item: topic.id }}
          doneExtra={after}
        />
      ) : (
        <ChoiceDrill key={slug} makeQuestions={() => setQuestions(set!)} doneLabel={set!.title} trackAs={{ drill: "set_quiz", item: slug }} doneExtra={after} />
      )}
    </div>
  );
}
