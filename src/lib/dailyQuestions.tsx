import { isValidElement, type ReactNode } from "react";
import SignalImage from "@/components/SignalImage";
import { type ChoiceQuestion } from "@/components/drills/ChoiceDrill";
import { quizQuestions } from "@/components/drills/acronymDrills";
import { PHONETIC_ALPHABET, PROWORDS_SET } from "@/content/sets/communication";
import { SET_TOPICS, findSet, getSetTopic, type LearnSet } from "@/content/sets";
import { setQuestions } from "@/lib/setQuiz";
import { MNEMONICS } from "@/content/mnemonics";
import { PSAR_QUESTIONS } from "@/content/psar";
import { withSeed } from "@/lib/daily";
import { shuffle } from "@/lib/shuffle";
import type { Signal } from "@/types";

function signalQuestion(signal: Signal, all: Signal[]): ChoiceQuestion {
  const others = shuffle(all.filter((s) => s.id !== signal.id)).slice(0, 3);
  return {
    id: `sig-${signal.id}`,
    tag: "Communication · Hand signals",
    prompt: (
      <div className="space-y-3">
        <p>What&apos;s this signal?</p>
        <SignalImage src={signal.imageUrl} alt="A lifesaver giving a signal" size="md" />
      </div>
    ),
    options: shuffle([signal.name, ...others.map((s) => s.name)]),
    answer: signal.name,
    explain: signal.description,
  };
}

function psarQuestion(): ChoiceQuestion {
  const q = shuffle(PSAR_QUESTIONS)[0];
  return {
    id: `psar-${q.id}`,
    tag: `PSAR manual · ${q.topic}`,
    prompt: q.question,
    options: shuffle([q.answer, ...q.wrong]),
    answer: q.answer,
    explain: q.explain,
  };
}

// The mix changed on this day. Earlier days, and anyone who'd already done that
// day's four questions, keep the questions they answered.
export const ALL_TOPICS_FROM = "2026-11-02";

export const DAILY_DESCRIPTION =
  "Five quick questions a day from across every topic, the same for everyone. A new mix every day.";

// Until 2 Nov 2026: a signal, an acronym letter, a radio question and a PSAR question
function legacyDailyQuestions(signals: Signal[], day: string): ChoiceQuestion[] {
  return withSeed(`daily|${day}`, () => {
    const sorted = [...signals].sort((a, b) => a.id.localeCompare(b.id));
    const signal = shuffle(sorted)[0];
    const mnemonic = shuffle(MNEMONICS)[0];
    const topic = getSetTopic(findSet(mnemonic.slug)?.topic ?? "")?.title ?? "Acronyms";
    const mnemonicQ = { ...shuffle(quizQuestions(mnemonic))[0], tag: `${topic} · ${mnemonic.name}` };
    const radioQ = { ...shuffle([...setQuestions(PROWORDS_SET, 99), ...setQuestions(PHONETIC_ALPHABET, 99)])[0], tag: "Radio" };
    return [signalQuestion(signal, sorted), mnemonicQ, radioQ, psarQuestion()];
  });
}

// One question from a random set (with a quiz) in these sets
function questionFrom(sets: LearnSet[]): { q: ChoiceQuestion; set: LearnSet } {
  const set = shuffle(sets)[0];
  const q = shuffle(setQuestions(set, 99))[0];
  return { q: { ...q, tag: `${getSetTopic(set.topic)!.title} · ${set.title}` }, set };
}

// Today's questions. Everything is picked and shuffled from a seed made from the
// (Sydney) date, so everyone gets the same set on the same day.
export function dailyQuestions(signals: Signal[], day: string, opts: { legacy?: boolean } = {}): ChoiceQuestion[] {
  if (day < ALL_TOPICS_FROM || opts.legacy) return legacyDailyQuestions(signals, day);
  return withSeed(`daily-v2|${day}`, () => {
    const sorted = [...signals].sort((a, b) => a.id.localeCompare(b.id));
    const used = new Set<string>();
    const quizSets = (sets: LearnSet[]) => sets.filter((s) => s.questions.length && !used.has(s.slug));
    const picks = SET_TOPICS.map((topic) => {
      // Communication: half the time it's a signal picture
      if (topic.id === "communication" && sorted.length && Math.random() < 0.5) {
        used.add("hand-signals");
        return { ...signalQuestion(shuffle(sorted)[0], sorted), tag: "Communication · Hand signals" };
      }
      const { q, set } = questionFrom(quizSets(topic.sets));
      used.add(set.slug);
      return q;
    });
    // The wildcard: any other set, from any topic
    const wildcard = questionFrom(quizSets(SET_TOPICS.flatMap((t) => t.sets))).q;
    return shuffle([...picks, wildcard]);
  });
}

// A question's words without pictures, for the "today's answers" list
function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    const text = textOf(node.props.children);
    return node.type === "p" || node.type === "div" ? `${text} ` : text;
  }
  return "";
}

export function plainPrompt(q: ChoiceQuestion): string {
  return textOf(q.prompt).replace(/\s+/g, " ").trim() || "Question";
}
