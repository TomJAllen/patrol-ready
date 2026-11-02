"use client";

import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { AcronymMatch } from "@/components/drills/acronymDrills";
import BuildCallDrill from "@/components/drills/BuildCallDrill";
import SpellDrill from "@/components/drills/SpellDrill";
import { EXTRA_INFO, getSet, getSetTopic, learnHref, topicHref, type ExtraKey } from "@/content/sets";

// A set's extra test: Spell it, Build the call or Match
export default function SetExtra({ topic: topicId, set: slug, extra }: { topic: string; set: string; extra: ExtraKey }) {
  const topic = getSetTopic(topicId)!;
  const set = getSet(topicId, slug)!;
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <Breadcrumbs trail={[{ href: "/topics", label: "Topics" }, { href: topicHref(topic.id), label: topic.title }]} />
      <header className="space-y-2">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">{set.title}</p>
        <h1 className="font-display text-4xl font-extrabold uppercase text-ink">{EXTRA_INFO[extra].label}</h1>
        <p className="text-gray-600">
          Need a refresher?{" "}
          <Link href={learnHref(set)} className="text-primary font-semibold hover:underline">
            Learn {set.title}
          </Link>
        </p>
      </header>
      {extra === "spell" && <SpellDrill />}
      {extra === "build-call" && <BuildCallDrill />}
      {extra === "match" && set.mnemonic && <AcronymMatch slug={set.mnemonic} />}
    </div>
  );
}
