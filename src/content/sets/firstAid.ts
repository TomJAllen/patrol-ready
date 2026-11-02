// First aid & resus: assessing, treating and handing over a patient. From the SLSA
// Public Safety and Aquatic Rescue Training Manual, 35th edition, in our own words.

import { fromMnemonic } from "./fromMnemonic";
import type { LearnSet } from "./types";

const SOURCE = "SLSA Public Safety and Aquatic Rescue Training Manual, 35th ed., Modules 6–7. Summarised in our own words.";

export const CPR: LearnSet = {
  slug: "cpr",
  topic: "first-aid",
  title: "CPR",
  purpose: "The numbers and technique for effective CPR.",
  whenToUse: ["A patient is unresponsive and not breathing normally (the C in DRSABCD)"],
  items: [
    { id: "ratio", term: "Compressions to breaths", meaning: "30 compressions to 2 breaths, for adults, children and infants." },
    { id: "rate", term: "Compression rate", meaning: "100–120 a minute, fully releasing between compressions." },
    { id: "depth", term: "Compression depth", meaning: "One third of the depth of the chest." },
    { id: "hands", term: "Hand position", meaning: "On the lower half of the sternum. Infants: usually two fingers." },
    { id: "swap", term: "Swapping rescuers", meaning: "Every 2 minutes, or sooner if tired." },
    { id: "roll", term: "Rolling onto their side", meaning: "If they vomit, regurgitate or show signs of recovery." },
  ],
  questions: ["meaning", "term", "fact"],
  prompts: { meaning: "{term}: which is right?", term: "Which part of CPR is this: “{meaning}”" },
  facts: ["cpr-ratio", "cpr-rate", "cpr-depth", "cpr-hands", "cpr-swap", "cpr-infant", "cpr-children-ratio", "recovery-roll"],
  source: SOURCE,
};

export const CHOKING: LearnSet = {
  slug: "choking",
  topic: "first-aid",
  title: "Choking",
  purpose: "Clearing a blocked airway in a choking adult.",
  whenToUse: ["Someone can't breathe, cough or speak because something is stuck"],
  ordered: true,
  items: [
    { id: "back-blows", term: "Back blows", meaning: "Up to five sharp blows between the shoulder blades with the heel of your hand, checking the airway after each." },
    { id: "chest-thrusts", term: "Chest thrusts", meaning: "If back blows don't clear it, up to five chest thrusts, checking after each." },
    { id: "alternate", term: "Keep alternating", meaning: "Five back blows, then five chest thrusts, until it clears or they become unresponsive." },
    { id: "unresponsive", term: "If they become unresponsive", meaning: "Start DRSABCD and CPR." },
  ],
  questions: ["next", "meaning", "fact"],
  prompts: { meaning: "{term}: what does it involve?" },
  facts: ["choking-back-blows", "choking-sequence"],
  source: SOURCE,
};

export const MARINE_STINGS: LearnSet = {
  slug: "marine-stings",
  topic: "first-aid",
  title: "Marine stings",
  purpose: "Treating stings from bluebottles and tropical jellyfish.",
  whenToUse: ["A swimmer comes out of the water with a sting"],
  items: [
    { id: "bluebottle", term: "Bluebottle", meaning: "Pick off tentacles, rinse with seawater, then hot water (as hot as they can bear) for 20 minutes." },
    { id: "box", term: "Box jellyfish and Irukandji", meaning: "Tropical stings: vinegar, and get help fast as they can be life-threatening." },
    { id: "no-vinegar", term: "Vinegar on a bluebottle", meaning: "Don't: it can make the stinging cells fire." },
    { id: "season", term: "Stinger season", meaning: "October to May in tropical Australia." },
  ],
  questions: ["meaning", "term", "fact"],
  prompts: { meaning: "What's the right advice for: {term}?", term: "Which is this advice about: “{meaning}”" },
  facts: ["bluebottle", "vinegar", "stinger-season"],
  source: SOURCE,
};

export const HEAD_INJURY: LearnSet = {
  slug: "head-injury-red-flags",
  topic: "first-aid",
  title: "Head injury red flags",
  purpose: "Signs after a knock to the head that mean you should call an ambulance.",
  whenToUse: ["Someone has hit their head on the sand, a board or the rocks"],
  items: [
    { id: "vomiting", term: "Repeated vomiting", meaning: "" },
    { id: "drowsy", term: "Getting drowsier", meaning: "" },
    { id: "headache", term: "Worsening headache or confusion", meaning: "" },
    { id: "seizure", term: "Seizures", meaning: "" },
    { id: "neck", term: "Neck pain", meaning: "" },
    { id: "limbs", term: "Weakness or tingling in the arms or legs", meaning: "" },
  ],
  questions: ["odd-one-out", "fact"],
  decoys: ["A small graze on the forehead", "Feeling embarrassed", "Wanting a drink of water", "Remembering what happened"],
  facts: ["head-injury"],
  source: SOURCE,
};

export const FIRST_AID_SETS: LearnSet[] = [
  fromMnemonic("drsabcd", "first-aid"),
  CPR,
  fromMnemonic("sample", "first-aid"),
  fromMnemonic("imist-ambo", "first-aid"),
  fromMnemonic("four-s", "first-aid", { decoys: ["Spinal injury", "Shock", "Scene safety", "Stabilised"] }),
  fromMnemonic("fast", "first-aid"),
  fromMnemonic("ricer", "first-aid"),
  fromMnemonic("harm", "first-aid"),
  CHOKING,
  MARINE_STINGS,
  HEAD_INJURY,
];
