// The shared shape for everything the app teaches.
//
//   Topic (Surf awareness)  →  Set (Types of waves)  →  Items (Spilling, Plunging…)
//
// A set is a small, self-contained thing to learn. Its Learn page and quiz are
// generated from this data, so adding a set means writing content, not code.

export type SetTopicId = "communication" | "first-aid" | "surf-awareness" | "patrol";

// Pictures are referenced by key, so content stays plain data. The key is
// drawn by SetVisual (src/components/SetVisual.tsx).
export type VisualKey = "wave-spilling" | "wave-plunging" | "wave-surging" | "wave-anatomy";

export interface SetItem {
  id: string;
  term: string; // "Plunging", "Crest", "Deeper, darker water"
  meaning: string; // one line: what it is ("" when the term says it all)
  letter?: string; // for acronyms and the phonetic alphabet
  aka?: string;
  details?: { label: string; text: string }[]; // extra lines on the Learn page ("Where", "Watch for")
  visual?: VisualKey;
  decoys?: string[]; // believable wrong answers for this item's letter question
}

// A situation where one item is the answer: "Waves slam down at the water's edge" → Plunging
export interface SetScenario {
  id: string;
  prompt: string;
  answer: string; // item id
  explain?: string;
}

// Which questions the quiz asks. Pick the ones that make sense for the set.
export type QuestionKind =
  | "meaning" // term → what it means
  | "term" // meaning → which term
  | "letter" // letter → term (acronyms, phonetic alphabet)
  | "picture" // visual → which term
  | "scenario" // situation → which item
  | "odd-one-out" // which of these isn't part of the set
  | "next" // what comes after X (ordered sets only)
  | "fact"; // questions from the PSAR manual question bank (src/content/psar.ts)

// Tests beyond the set's quiz. Identify and Perform are the signal study pages;
// the rest live at /test/<topic>/<set>/<extra>.
export type ExtraKey = "identify" | "perform" | "spell" | "build-call" | "match";

// Custom Learn page sections, for sets with more than a list of items
export type LearnSectionKey = "radio-calls";

// An older result that still counts towards passing a set, so progress carries over
export interface LegacyResult {
  drill: string;
  item?: string | null; // when set, the result must be for this item
  pass: "perfect" | "ninety" | "no-mistakes";
}

export interface LearnSet {
  slug: string;
  topic: SetTopicId;
  title: string;
  purpose: string; // "What is it for?" One line, also used for set-level questions
  whenToUse?: string[]; // short trigger situations
  ordered?: boolean; // true when the order matters (DRSABCD)
  intro?: string;
  items: SetItem[];
  count?: number; // how many things to learn, when items aren't listed here (signals)
  questions: QuestionKind[];
  prompts?: { meaning?: string; term?: string; letter?: string; scenario?: string }; // {term} {meaning} {letter} {title} {prompt}
  scenarios?: SetScenario[];
  scenarioIntro?: string; // shown above the Match board
  decoys?: string[]; // believable things that are NOT in the set, for odd-one-out
  facts?: string[]; // PSAR question ids
  mnemonic?: string; // acronym slug in src/content/mnemonics.ts, for letter questions and Match
  extras?: ExtraKey[];
  learnHref?: string; // the set has its own Learn page (signals)
  learnSection?: LearnSectionKey;
  visual?: VisualKey; // one picture for the whole set
  notes?: { title: string; points: string[] }[];
  legacy?: LegacyResult[];
  source: string;
}

export interface SetTopic {
  id: SetTopicId;
  title: string;
  blurb: string;
  sets: LearnSet[];
}
