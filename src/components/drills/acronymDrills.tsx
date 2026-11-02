"use client";

import { MNEMONICS, type Mnemonic } from "@/content/mnemonics";
import { shuffle } from "@/lib/shuffle";
import { sameLetterOptions, matchCards, matchSource } from "@/lib/mnemonicQuiz";
import type { ChoiceQuestion } from "./ChoiceDrill";
import MatchDrill from "./MatchDrill";

// The mnemonic's letters with one highlighted, e.g. IM[I]ST AMBO
function Letters({ m, highlight }: { m: Mnemonic; highlight?: number }) {
  return (
    <span className="inline-flex flex-wrap gap-1 font-black tracking-wide" aria-label={m.name}>
      {m.items.map((it, i) => (
        <span
          key={i}
          className={`w-9 h-10 flex items-center justify-center rounded-lg text-lg ${
            i === highlight ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
          }`}
        >
          {it.letter}
        </span>
      ))}
    </span>
  );
}

export function quizQuestions(m: Mnemonic): ChoiceQuestion[] {
  return shuffle(m.items.map((item, i) => ({ item, i }))).map(({ item, i }) => {
    // Every option starts with the same letter, so the letter alone gives nothing away
    const distractors = sameLetterOptions(m, i);
    return {
      id: `${m.slug}-${i}`,
      // A set like the 4 Ps has no "letter 2", so ask which option belongs to it
      prompt: m.unordered ? (
        <div className="space-y-3">
          <Letters m={m} />
          <p>Which of these is one of the {m.name}?</p>
        </div>
      ) : (
        <div className="space-y-3">
          <Letters m={m} highlight={i} />
          <p>
            In {m.name}, what does letter {i + 1} ({item.letter}) stand for?
          </p>
        </div>
      ),
      options: shuffle([item.term, ...distractors]),
      answer: item.term,
      explain: item.detail ? (
        <>
          <strong>{item.term}:</strong> {item.detail}
        </>
      ) : undefined,
    };
  });
}

const MATCH_INTRO = {
  scenario: (m: Mnemonic) => m.sort!.intro,
  detail: (m: Mnemonic) =>
    m.unordered ? `Put each description under the right one of the ${m.name}.` : `Match each description to its letter in ${m.name}.`,
  term: (m: Mnemonic) => `Put the words of ${m.name} in order.`,
};

// Drag each statement onto the letter it belongs to
export function AcronymMatch({ slug }: { slug: string }) {
  const m = MNEMONICS.find((x) => x.slug === slug)!;
  return (
    <MatchDrill
      rows={m.items.map((it) => ({ letter: it.letter, term: it.term, label: m.unordered ? it.term : undefined }))}
      makeCards={() => matchCards(m)}
      intro={MATCH_INTRO[matchSource(m)](m)}
      trackAs={{ drill: "mnemonic_match", item: m.slug }}
    />
  );
}
