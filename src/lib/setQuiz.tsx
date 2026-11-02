// Builds quiz questions from set content. Each set says which kinds of question
// suit it (see QuestionKind); a topic quiz mixes sets and adds questions about
// the sets themselves ("What is this for?", "Which does this belong to?").

import type { ChoiceQuestion } from "@/components/drills/ChoiceDrill";
import SetVisual from "@/components/SetVisual";
import { getSetTopic, type LearnSet, type QuestionKind, type SetItem } from "@/content/sets";
import { shuffle } from "@/lib/shuffle";

export const SET_QUIZ_LENGTH = 10;
export const TOPIC_QUIZ_LENGTH = 12;

// Up to `count` wrong answers: from the same set first, then other sets in the topic
function distractors(set: LearnSet, item: SetItem, field: "term" | "meaning", count = 3): string[] {
  const fromSet = shuffle(set.items.filter((i) => i.id !== item.id)).map((i) => i[field]);
  const others = shuffle(
    (getSetTopic(set.topic)?.sets ?? []).filter((s) => s.slug !== set.slug).flatMap((s) => s.items)
  ).map((i) => i[field]);
  return [...new Set([...fromSet, ...others])].filter((x) => x !== item[field]).slice(0, count);
}

function choice(id: string, prompt: ChoiceQuestion["prompt"], answer: string, wrong: string[], explain?: ChoiceQuestion["explain"]): ChoiceQuestion {
  return { id, prompt, answer, options: shuffle([answer, ...wrong]), explain };
}

function questionsOfKind(set: LearnSet, kind: QuestionKind): ChoiceQuestion[] {
  const byId = (id: string) => set.items.find((i) => i.id === id)!;
  switch (kind) {
    case "meaning":
      return set.items.map((it) =>
        choice(`${set.slug}:meaning:${it.id}`, <>What is <strong>{it.term}</strong>?</>, it.meaning, distractors(set, it, "meaning"))
      );
    case "term":
      return set.items.map((it) =>
        choice(`${set.slug}:term:${it.id}`, <>Which is this: <em>&ldquo;{it.meaning}&rdquo;</em></>, it.term, distractors(set, it, "term"), it.meaning)
      );
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
        return choice(`${set.slug}:scenario:${sc.id}`, <>{sc.prompt}</>, it.term, distractors(set, it, "term"), sc.explain);
      });
    case "odd-one-out":
      return shuffle(set.decoys ?? []).slice(0, 3).map((decoy) =>
        choice(
          `${set.slug}:odd:${decoy}`,
          <>Which of these is <strong>not</strong> one of the {set.title.toLowerCase()}?</>,
          decoy,
          shuffle(set.items).slice(0, 3).map((i) => i.term),
          <>The {set.title.toLowerCase()} are: {set.items.map((i) => i.term).join("; ")}.</>
        )
      );
    case "next":
      if (!set.ordered) return [];
      return set.items.slice(0, -1).map((it, i) => {
        const next = set.items[i + 1];
        return choice(`${set.slug}:next:${it.id}`, <>In {set.title}, what comes after <strong>{it.term}</strong>?</>, next.term, distractors(set, next, "term").filter((t) => t !== it.term));
      });
  }
}

// One set's quiz: a shuffled mix of its question kinds, so every kind gets a look-in
export function setQuestions(set: LearnSet, length = SET_QUIZ_LENGTH): ChoiceQuestion[] {
  const pools = set.questions.map((k) => shuffle(questionsOfKind(set, k)));
  const picked: ChoiceQuestion[] = [];
  // Take one from each kind in turn until we have enough
  while (picked.length < length && pools.some((p) => p.length)) {
    for (const p of pools) {
      const q = p.shift();
      if (q && picked.length < length) picked.push(q);
    }
  }
  return shuffle(picked);
}

// Questions about the sets themselves, for a topic quiz
export function setLevelQuestions(topicId: string): ChoiceQuestion[] {
  const sets = getSetTopic(topicId)?.sets ?? [];
  if (sets.length < 2) return [];
  const titles = sets.map((s) => s.title);
  const wrongTitles = (s: LearnSet) => shuffle(titles.filter((t) => t !== s.title)).slice(0, 3);
  const purpose = sets.map((s) =>
    choice(`${s.slug}:purpose`, <>Which one covers: <em>&ldquo;{s.purpose}&rdquo;</em></>, s.title, wrongTitles(s))
  );
  const belongs = sets.flatMap((s) =>
    shuffle(s.items).slice(0, 2).map((it) =>
      choice(`${s.slug}:belongs:${it.id}`, <>Where does <strong>&ldquo;{it.term}&rdquo;</strong> belong?</>, s.title, wrongTitles(s), it.meaning)
    )
  );
  return [...purpose, ...belongs];
}

// A whole topic: a couple from each set, plus questions about the sets
export function topicQuestions(topicId: string, length = TOPIC_QUIZ_LENGTH): ChoiceQuestion[] {
  const sets = getSetTopic(topicId)?.sets ?? [];
  const perSet = Math.max(2, Math.floor((length * 0.7) / Math.max(sets.length, 1)));
  const fromSets = sets.flatMap((s) => setQuestions(s, perSet).map((q) => ({ ...q, tag: s.title })));
  const about = shuffle(setLevelQuestions(topicId)).slice(0, Math.max(0, length - fromSets.length));
  return shuffle([...fromSets, ...about]).slice(0, length);
}
