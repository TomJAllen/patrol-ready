// Builds quiz questions from set content. Each set says which kinds of question
// suit it (see QuestionKind); a topic quiz mixes sets and adds questions about
// the sets themselves ("Which one covers…?", "Where does this belong?").

import type { ChoiceQuestion } from "@/components/drills/ChoiceDrill";
import { quizQuestions as acronymLetterQuestions } from "@/components/drills/acronymDrills";
import SetVisual from "@/components/SetVisual";
import { getMnemonic } from "@/content/mnemonics";
import { PSAR_QUESTIONS } from "@/content/psar";
import { getSetTopic, type LearnSet, type QuestionKind, type SetItem } from "@/content/sets";
import { tooSimilar } from "@/lib/mnemonicQuiz";
import { shuffle } from "@/lib/shuffle";

export const SET_QUIZ_LENGTH = 10;
export const TOPIC_QUIZ_LENGTH = 12;

const DEFAULT_PROMPTS = {
  meaning: "What is {term}?",
  term: "Which is this: “{meaning}”",
  letter: "In {title}, what does {letter} stand for?",
  scenario: "{prompt}",
};

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

function prompt(set: LearnSet, kind: keyof typeof DEFAULT_PROMPTS, vars: Record<string, string>): string {
  return fill(set.prompts?.[kind] ?? DEFAULT_PROMPTS[kind], { title: set.title, ...vars });
}

function otherSets(set: LearnSet): LearnSet[] {
  return (getSetTopic(set.topic)?.sets ?? []).filter((s) => s.slug !== set.slug);
}

// Up to `count` wrong answers: from the same set first, then other sets in the topic
function distractors(set: LearnSet, item: SetItem, field: "term" | "meaning", count = 3): string[] {
  const usable = (i: SetItem) => !!i[field];
  const fromSet = shuffle(set.items.filter((i) => i.id !== item.id && usable(i))).map((i) => i[field]);
  const others = shuffle(otherSets(set).flatMap((s) => s.items).filter(usable)).map((i) => i[field]);
  return [...new Set([...fromSet, ...others])].filter((x) => x !== item[field]).slice(0, count);
}

function choice(id: string, q: ChoiceQuestion["prompt"], answer: string, wrong: string[], explain?: ChoiceQuestion["explain"]): ChoiceQuestion {
  return { id, prompt: q, answer, options: shuffle([answer, ...wrong]), explain };
}

// Things that aren't in this set: its own decoys, or real items from the rest of the topic
function oddOneOutCandidates(set: LearnSet): string[] {
  if (set.decoys?.length) return set.decoys;
  const own = set.items.map((i) => i.term);
  const seen: string[] = [];
  for (const term of shuffle(otherSets(set).flatMap((s) => s.items.map((i) => i.term)))) {
    if (own.some((o) => tooSimilar(o, term)) || seen.some((x) => tooSimilar(x, term))) continue;
    seen.push(term);
  }
  return seen;
}

function questionsOfKind(set: LearnSet, kind: QuestionKind): ChoiceQuestion[] {
  const byId = (id: string) => set.items.find((i) => i.id === id)!;
  const withMeaning = set.items.filter((i) => i.meaning);
  switch (kind) {
    case "meaning":
      return withMeaning.map((it) =>
        choice(`${set.slug}:meaning:${it.id}`, prompt(set, "meaning", { term: it.term }), it.meaning, distractors(set, it, "meaning"))
      );
    case "term":
      return withMeaning.map((it) =>
        choice(`${set.slug}:term:${it.id}`, prompt(set, "term", { meaning: it.meaning }), it.term, distractors(set, it, "term"), it.meaning)
      );
    case "letter": {
      // Acronyms keep their hand-tuned questions, where every option starts with the same letter
      const m = set.mnemonic ? getMnemonic(set.mnemonic) : undefined;
      if (m) return acronymLetterQuestions(m).map((q) => ({ ...q, id: `${set.slug}:letter:${q.id}` }));
      return set.items
        .filter((it) => it.letter)
        .map((it) =>
          choice(
            `${set.slug}:letter:${it.id}`,
            prompt(set, "letter", { letter: it.letter! }),
            it.term,
            it.decoys?.length ? shuffle(it.decoys).slice(0, 3) : distractors(set, it, "term"),
            it.meaning || undefined
          )
        );
    }
    case "picture":
      return set.items
        .filter((it) => it.visual)
        .map((it) =>
          choice(
            `${set.slug}:picture:${it.id}`,
            <span className="block space-y-2">
              <span className="block max-w-xs">
                <SetVisual name={it.visual!} />
              </span>
              <span className="block">Which is this?</span>
            </span>,
            it.term,
            distractors(set, it, "term"),
            it.meaning
          )
        );
    case "scenario":
      return (set.scenarios ?? []).map((sc) => {
        const it = byId(sc.answer);
        // Only offer other items from this set, so every option is a real part of it
        const wrong = shuffle(set.items.filter((i) => i.id !== it.id && i.term !== it.term).map((i) => i.term));
        return choice(
          `${set.slug}:scenario:${sc.id}`,
          prompt(set, "scenario", { prompt: sc.prompt }),
          it.term,
          [...new Set(wrong)].slice(0, 3),
          sc.explain ?? (it.meaning ? <><strong>{it.term}:</strong> {it.meaning}</> : undefined)
        );
      });
    case "odd-one-out": {
      if (set.items.length < 3) return [];
      return shuffle(oddOneOutCandidates(set)).slice(0, 3).map((odd) =>
        choice(
          `${set.slug}:odd-one-out:${odd}`,
          <>Which of these is <strong>not</strong> part of {set.title}?</>,
          odd,
          shuffle(set.items).slice(0, 3).map((i) => i.term),
          <>{set.title}: {set.items.map((i) => i.term).join(", ")}.</>
        )
      );
    }
    case "next":
      if (!set.ordered) return [];
      return set.items.slice(0, -1).map((it, i) => {
        const next = set.items[i + 1];
        const wrong = shuffle(set.items.filter((x, j) => j !== i + 1 && j !== i && x.term !== next.term).map((x) => x.term));
        if (wrong.length < 2) wrong.push(...distractors(set, next, "term").filter((t) => t !== it.term && !wrong.includes(t)));
        return choice(`${set.slug}:next:${it.id}`, <>In {set.title}, what comes after <strong>{it.term}</strong>?</>, next.term, [...new Set(wrong)].slice(0, 3));
      });
    case "fact":
      return (set.facts ?? [])
        .map((id) => PSAR_QUESTIONS.find((q) => q.id === id))
        .filter((q) => !!q)
        .map((q) => choice(`${set.slug}:fact:${q.id}`, q.question, q.answer, q.wrong, q.explain));
  }
}

// One set's quiz: take a question from each kind in turn, so every kind gets a look-in
export function setQuestions(set: LearnSet, length = SET_QUIZ_LENGTH): ChoiceQuestion[] {
  const pools = set.questions.map((k) => shuffle(questionsOfKind(set, k)));
  const picked: ChoiceQuestion[] = [];
  while (picked.length < length && pools.some((p) => p.length)) {
    for (const p of pools) {
      const q = p.shift();
      if (q && picked.length < length) picked.push(q);
    }
  }
  return shuffle(picked);
}

// Questions about the sets themselves, for a topic quiz. Only between acronyms,
// where it's a real test (SAMPLE or IMIST AMBO?); "which set is 'Out' in?" is
// too obvious to be worth asking.
export function setLevelQuestions(topicId: string): ChoiceQuestion[] {
  const acronyms = (getSetTopic(topicId)?.sets ?? []).filter((s) => s.mnemonic);
  if (acronyms.length < 3) return [];
  const wrong = (s: LearnSet) => shuffle(acronyms.filter((x) => x.slug !== s.slug).map((x) => x.title)).slice(0, 3);
  return acronyms.flatMap((s) => [
    choice(`${s.slug}:purpose`, <>Which acronym is for: <em>{s.purpose}</em>?</>, s.title, wrong(s)),
    ...(s.whenToUse ?? []).slice(0, 1).map((w) =>
      choice(`${s.slug}:when`, <>{w} Which acronym do you use?</>, s.title, wrong(s))
    ),
  ]);
}

// A whole topic: a spread from every set, plus a few questions about the acronyms
export function topicQuestions(topicId: string, length = TOPIC_QUIZ_LENGTH): ChoiceQuestion[] {
  const sets = (getSetTopic(topicId)?.sets ?? []).filter((s) => s.questions.length);
  // At most one question per set about the set itself, so the two don't repeat each other
  const about = shuffle(setLevelQuestions(topicId)).filter(
    (q, i, all) => all.findIndex((x) => x.id.split(":")[0] === q.id.split(":")[0]) === i
  );
  const aboutCount = Math.min(about.length, Math.ceil(length * 0.25));
  const need = length - aboutCount;
  const perSet = Math.max(1, Math.ceil(need / Math.max(sets.length, 1)));
  const fromSets = shuffle(sets.flatMap((s) => setQuestions(s, perSet).map((q) => ({ ...q, tag: s.title }))));
  return shuffle([...fromSets.slice(0, need), ...about.slice(0, aboutCount)]);
}
