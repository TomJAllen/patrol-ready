"use client";

import { useState } from "react";
import Link from "next/link";
import { WAVE_DRILLS, WAVE_TERMS, WAVE_TYPE_QUESTIONS, WAVE_TYPES, getWaveType, type WaveDrill } from "@/content/waves";
import { shuffle } from "@/lib/shuffle";
import ChoiceDrill, { type ChoiceQuestion } from "@/components/drills/ChoiceDrill";
import Tabs from "@/components/drills/Tabs";
import Breadcrumbs from "@/components/Breadcrumbs";
import { WaveTypeProfile } from "@/components/WaveDiagram";

// Read a situation and pick spilling, plunging or surging. A few questions show
// the drawing instead, so you learn to recognise the shape too.
export function waveTypeQuestions(): ChoiceQuestion[] {
  const names = WAVE_TYPES.map((w) => w.name);
  const fromText = WAVE_TYPE_QUESTIONS.map((q) => ({
    id: `wt-${q.id}`,
    prompt: <>{q.prompt}</>,
    options: shuffle(names),
    answer: getWaveType(q.answer).name,
    explain: <>{q.explain}</>,
  }));
  const fromPicture = WAVE_TYPES.map((w) => ({
    id: `wt-pic-${w.id}`,
    prompt: (
      <span className="block space-y-2">
        <span className="block max-w-xs">
          <WaveTypeProfile type={w.id} />
        </span>
        <span className="block">Which type of wave is this?</span>
      </span>
    ),
    options: shuffle(names),
    answer: w.name,
    explain: <>{w.looks}</>,
  }));
  return shuffle([...fromText, ...fromPicture]);
}

// Wave words, both ways round (like prowords)
export function waveTermQuestions(): ChoiceQuestion[] {
  return shuffle(WAVE_TERMS).map((t, i) => {
    const wrong = shuffle(WAVE_TERMS.filter((x) => x.term !== t.term)).slice(0, 3);
    return i % 2 === 0
      ? {
          id: `wterm-${t.term}`,
          prompt: <>What is the <strong>{t.term.toLowerCase()}</strong>?</>,
          options: shuffle([t.meaning, ...wrong.map((w) => w.meaning)]),
          answer: t.meaning,
        }
      : {
          id: `wterm-${t.term}`,
          prompt: <>Which word means: <em>&ldquo;{t.meaning}&rdquo;</em></>,
          options: shuffle([t.term, ...wrong.map((w) => w.term)]),
          answer: t.term,
        };
  });
}

export default function WavesPractice({ initialTab }: { initialTab?: string }) {
  const [mode, setMode] = useState<WaveDrill>(WAVE_DRILLS.find((m) => m === initialTab) ?? "types");

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <Breadcrumbs trail={[{ href: "/test", label: "Test" }, { href: "/test/waves", label: "Waves" }]} />
      <header className="space-y-2">
        <h1 className="font-display text-4xl font-extrabold uppercase text-ink">Test your waves</h1>
        <p className="text-gray-600">
          Need a refresher?{" "}
          <Link href="/learn/waves" className="text-primary font-semibold hover:underline">
            Learn waves
          </Link>
        </p>
      </header>

      <Tabs
        tabs={[
          { id: "types", label: "Wave types" },
          { id: "terms", label: "Wave words" },
        ]}
        active={mode}
        onChange={(m) => {
          setMode(m);
          window.history.replaceState(null, "", `/test/waves/${m}`);
        }}
      />

      {mode === "types" && <ChoiceDrill key="wt" makeQuestions={waveTypeQuestions} doneLabel="Wave types" trackAs={{ drill: "waves_types" }} />}
      {mode === "terms" && <ChoiceDrill key="wterm" makeQuestions={waveTermQuestions} doneLabel="Wave words" trackAs={{ drill: "waves_terms" }} />}
    </div>
  );
}
