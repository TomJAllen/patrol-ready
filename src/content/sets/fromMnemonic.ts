// Turns an acronym from src/content/mnemonics.ts into a set, so the acronym
// content stays in one place and keeps its hand-tuned letter questions.

import { getMnemonic } from "@/content/mnemonics";
import type { LearnSet, SetTopicId } from "./types";

export function fromMnemonic(slug: string, topic: SetTopicId, extra: Partial<LearnSet> = {}): LearnSet {
  const m = getMnemonic(slug);
  if (!m) throw new Error(`Unknown acronym: ${slug}`);
  const facts = m.sort?.facts ?? [];
  const base = {
    questions: ["letter", ...(facts.length ? (["scenario"] as const) : []), ...(m.unordered ? [] : (["next"] as const)), "odd-one-out"] as LearnSet["questions"],
  };
  return {
    slug,
    topic,
    title: m.name,
    purpose: m.title,
    whenToUse: [m.when],
    ordered: !m.unordered,
    mnemonic: slug,
    items: m.items.map((it, i) => ({ id: String(i), term: it.term, meaning: it.detail, letter: it.letter })),
    questions: base.questions,
    prompts: { scenario: `Where does this go in ${m.name}? “{prompt}”` },
    scenarios: facts.map((f, i) => ({ id: `s${i}`, prompt: f.text, answer: String(f.item) })),
    scenarioIntro: m.sort?.intro,
    extras: ["match"],
    notes: m.note ? [{ title: "Good to know", points: [m.note] }] : undefined,
    legacy: [{ drill: "mnemonic_quiz", item: slug, pass: "perfect" }],
    source: `SLSA Public Safety and Aquatic Rescue Training Manual, 35th ed., ${m.source}. Summarised in our own words.`,
    ...extra,
    ...(extra.facts ? { questions: [...base.questions, "fact" as const] } : {}),
  };
}
