"use client";

import Link from "next/link";
import ChoiceDrill from "@/components/drills/ChoiceDrill";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getSet, getSetTopic, learnHref } from "@/content/sets";
import { setQuestions, topicQuestions } from "@/lib/setQuiz";

// Quiz for one set, or for a whole topic when `set` is "mixed"
export default function SetQuiz({ topic: topicId, set: slug }: { topic: string; set: string }) {
  const topic = getSetTopic(topicId)!;
  const mixed = slug === "mixed";
  const set = mixed ? undefined : getSet(topicId, slug)!;
  const title = mixed ? `All of ${topic.title.toLowerCase()}` : set!.title;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <Breadcrumbs trail={[{ href: "/test", label: "Test" }, { href: `/test/${topic.id}`, label: topic.title }]} />
      <header className="space-y-2">
        <h1 className="font-display text-4xl font-extrabold uppercase text-ink">{title}</h1>
        <p className="text-gray-600">
          Need a refresher?{" "}
          <Link href={mixed ? `/learn/${topic.id}` : learnHref(set!)} className="text-primary font-semibold hover:underline">
            Learn {mixed ? topic.title.toLowerCase() : title}
          </Link>
        </p>
      </header>
      {mixed ? (
        <ChoiceDrill key="mixed" makeQuestions={() => topicQuestions(topic.id)} doneLabel={topic.title} trackAs={{ drill: "topic_mixed", item: topic.id }} />
      ) : (
        <ChoiceDrill key={slug} makeQuestions={() => setQuestions(set!)} doneLabel={set!.title} trackAs={{ drill: "set_quiz", item: slug }} />
      )}
    </div>
  );
}
