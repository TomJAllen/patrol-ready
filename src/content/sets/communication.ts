// Communication: signals, radio procedure and incident reports. Radio content is
// kept in src/content/radio.ts and the signals live in the database.

import { CALL_SIGNS, PHONETIC, PHONETIC_DECOYS, PROWORDS } from "@/content/radio";
import { fromMnemonic } from "./fromMnemonic";
import type { LearnSet } from "./types";

const RADIO_SOURCE = "SLSA Public Safety and Aquatic Rescue Training Manual, 35th ed., Module 3 – Radio Operations. Summarised in our own words.";
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const HAND_SIGNALS: LearnSet = {
  slug: "hand-signals",
  topic: "communication",
  title: "Hand signals",
  purpose: "Signalling between the beach and lifesavers or craft in the water.",
  whenToUse: ["Directing an IRB or a lifesaver in the water", "Asking the beach for help from the water"],
  items: [],
  count: 14,
  questions: [],
  extras: ["identify", "perform"],
  learnHref: "/learn/signals",
  source: "SLSA Public Safety and Aquatic Rescue Training Manual, 35th ed., Module 3.",
};

export const PROWORDS_SET: LearnSet = {
  slug: "prowords",
  topic: "communication",
  title: "Prowords",
  purpose: "Short words with an agreed meaning that keep radio messages short.",
  whenToUse: ["Every radio call: starting, replying, ending and correcting a message"],
  items: PROWORDS.map((p) => ({ id: slugify(p.word), term: p.word, meaning: p.meaning })),
  questions: ["meaning", "term"],
  prompts: { meaning: "What does “{term}” mean?", term: "Which proword means: “{meaning}”" },
  legacy: [{ drill: "radio_prowords", pass: "ninety" }],
  source: RADIO_SOURCE,
};

export const PHONETIC_ALPHABET: LearnSet = {
  slug: "phonetic-alphabet",
  topic: "communication",
  title: "Phonetic alphabet",
  purpose: "Spelling out names, places and codes clearly over the radio.",
  whenToUse: ["Spelling a beach, street or name that could be misheard", "Reading out a code or call sign"],
  intro: "Numbers are said one digit at a time (“one-eight-five”).",
  items: PHONETIC.map((p) => ({
    id: p.letter.toLowerCase(),
    term: p.word,
    letter: p.letter,
    meaning: `Say it “${p.say}”.`,
    decoys: PHONETIC_DECOYS[p.letter],
  })),
  questions: ["letter"],
  prompts: { letter: "Which word is used for {letter}?" },
  extras: ["spell"],
  legacy: [
    { drill: "radio_phonetic", pass: "ninety" },
    { drill: "radio_spell", pass: "ninety" },
  ],
  source: RADIO_SOURCE,
};

export const CALL_SIGNS_SET: LearnSet = {
  slug: "call-signs",
  topic: "communication",
  title: "Call signs",
  purpose: "The standard names for stations on the radio network.",
  whenToUse: ["Calling another station", "Saying who you are when you call"],
  items: CALL_SIGNS.map((c) => ({
    id: slugify(c.sign),
    term: c.sign,
    meaning: c.usedFor,
    details: c.example !== c.sign ? [{ label: "Example", text: c.example }] : undefined,
  })),
  questions: ["meaning", "term"],
  prompts: { meaning: "Who is “{term}” on the radio?", term: "Which call sign is used for: “{meaning}”" },
  notes: [{ title: "Good to know", points: ["Your area may use other call signs too. Check your local SOPs."] }],
  source: RADIO_SOURCE,
};

export const RADIO_CALLS: LearnSet = {
  slug: "radio-calls",
  topic: "communication",
  title: "Radio calls",
  purpose: "Making a call, radio checks, emergencies and good radio technique.",
  whenToUse: ["Calling SurfCom, the patrol, a tower or the IRB", "Clearing the channel in an emergency"],
  items: [],
  count: 4,
  questions: [],
  extras: ["build-call"],
  learnSection: "radio-calls",
  legacy: [{ drill: "radio_build_call", pass: "no-mistakes" }],
  source: `${RADIO_SOURCE} Example calls use our own details.`,
};

// Plausible P words, so the odd one out isn't obvious from the letter
// Mostly "which P is this?" from real radio report lines, plus plausible P words
// so the odd one out isn't obvious from the letter
export const FOUR_PS = fromMnemonic("four-ps", "communication", {
  questions: ["scenario", "odd-one-out"],
  prompts: { scenario: "Which of the 4 Ps is this? “{prompt}”" },
  decoys: ["Pulse", "Priority", "Pain", "Patrol"],
});

export const COMMUNICATION_SETS: LearnSet[] = [HAND_SIGNALS, PROWORDS_SET, PHONETIC_ALPHABET, CALL_SIGNS_SET, RADIO_CALLS, FOUR_PS];
