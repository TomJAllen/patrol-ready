// The shared shape for everything the app teaches.
//
//   Topic (Surf awareness)  →  Set (Types of waves)  →  Items (Spilling, Plunging…)
//
// A set is a small, self-contained thing to learn. Its Learn page and quiz are
// generated from this data, so adding a set means writing content, not code.

export type SetTopicId = "surf-awareness";

// Pictures are referenced by key, so content stays plain data. The key is
// drawn by SetVisual (src/components/SetVisual.tsx).
export type VisualKey = "wave-spilling" | "wave-plunging" | "wave-surging" | "wave-anatomy";

export interface SetItem {
  id: string;
  term: string; // "Plunging", "Crest", "Deeper, darker water"
  meaning: string; // one line: what it is
  letter?: string; // for acronyms: the letter this item stands for
  aka?: string;
  details?: { label: string; text: string }[]; // extra lines on the Learn page ("Where", "Watch for")
  visual?: VisualKey;
}

// A situation where one item is the answer: "Waves slam down at the water's edge" → Plunging
export interface SetScenario {
  id: string;
  prompt: string;
  answer: string; // item id
  explain: string;
}

// Which questions the quiz asks. Pick the ones that make sense for the set.
export type QuestionKind =
  | "meaning" // term → what it means
  | "term" // meaning → which term
  | "picture" // visual → which term
  | "scenario" // situation → which item
  | "odd-one-out" // which of these isn't part of the set (needs decoys)
  | "next"; // what comes after X (ordered sets only)

export interface LearnSet {
  slug: string;
  topic: SetTopicId;
  title: string;
  purpose: string; // "What is it for?" One line, also used for set-level questions
  whenToUse?: string[]; // short trigger situations
  ordered?: boolean; // true when the order matters (DRSABCD, a radio call)
  intro?: string;
  items: SetItem[];
  questions: QuestionKind[];
  scenarios?: SetScenario[];
  decoys?: string[]; // believable things that are NOT in the set, for odd-one-out
  visual?: VisualKey; // one picture for the whole set
  notes?: { title: string; points: string[] }[];
  source: string;
}

export interface SetTopic {
  id: SetTopicId;
  title: string;
  blurb: string;
  sets: LearnSet[];
}
