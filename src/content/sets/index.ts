import { COMMUNICATION_SETS } from "./communication";
import { FIRST_AID_SETS } from "./firstAid";
import { PATROL_SETS } from "./patrol";
import { SURF_AWARENESS_SETS } from "./surfAwareness";
import type { ExtraKey, LearnSet, SetTopic, SetTopicId } from "./types";

export * from "./types";

export const SET_TOPICS: SetTopic[] = [
  {
    id: "communication",
    title: "Communication",
    blurb: "Hand signals, the radio and reporting an incident.",
    sets: COMMUNICATION_SETS,
  },
  {
    id: "first-aid",
    title: "First aid & resus",
    blurb: "Assessing, treating and handing over a patient.",
    sets: FIRST_AID_SETS,
  },
  {
    id: "surf-awareness",
    title: "Surf awareness",
    blurb: "Reading the water: types of waves, signs of a rip and the words for it all.",
    sets: SURF_AWARENESS_SETS,
  },
  {
    id: "patrol",
    title: "Patrol & safety",
    blurb: "Beach flags, being fit for patrol and working well as a team.",
    sets: PATROL_SETS,
  },
];

export const ALL_SETS: LearnSet[] = SET_TOPICS.flatMap((t) => t.sets);

export function getSetTopic(id: string): SetTopic | undefined {
  return SET_TOPICS.find((t) => t.id === id);
}

export function getSet(topic: string, slug: string): LearnSet | undefined {
  return getSetTopic(topic)?.sets.find((s) => s.slug === slug);
}

export function findSet(slug: string): LearnSet | undefined {
  return ALL_SETS.find((s) => s.slug === slug);
}

export function isSetTopic(id: string): id is SetTopicId {
  return SET_TOPICS.some((t) => t.id === id);
}

export const EXTRA_INFO: Record<ExtraKey, { label: string; description: string }> = {
  identify: { label: "Identify", description: "See a signal and pick its name." },
  perform: { label: "Perform", description: "Do each signal on camera and get instant feedback." },
  spell: { label: "Spell it", description: "Type out call signs and words in the phonetic alphabet." },
  "build-call": { label: "Build the call", description: "Put a radio exchange in the right order." },
  match: { label: "Match", description: "Drag real details onto the right letter." },
};

// A topic's page: its sets, each with Learn and its tests
export function topicHref(topic: string): string {
  return `/topics/${topic}`;
}

// A quick quiz of n random questions from across a topic
export const QUICK_QUIZ_SIZES = [5, 10, 15] as const;
export function quickQuizHref(topic: string, n: number): string {
  return `/test/${topic}/mixed?n=${n}`;
}

export function learnHref(set: LearnSet): string {
  return set.learnHref ?? `/learn/${set.topic}/${set.slug}`;
}

export function extraHref(set: LearnSet, extra: ExtraKey): string {
  if (extra === "identify") return "/study/identify";
  if (extra === "perform") return "/study/perform";
  return `/test/${set.topic}/${set.slug}/${extra}`;
}

// The set's main test: its quiz, or its first extra when it has no quiz
export function testHref(set: LearnSet): string {
  if (set.questions.length) return `/test/${set.topic}/${set.slug}`;
  return extraHref(set, set.extras![0]);
}

// Every test for a set, quiz first
export function setTests(set: LearnSet): { label: string; description: string; href: string }[] {
  return [
    ...(set.questions.length ? [{ label: "Quiz", description: "A mix of questions on everything in this set.", href: `/test/${set.topic}/${set.slug}` }] : []),
    ...(set.extras ?? []).map((e) => ({ ...EXTRA_INFO[e], href: extraHref(set, e) })),
  ];
}
