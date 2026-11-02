import { SURF_AWARENESS_SETS } from "./surfAwareness";
import type { LearnSet, SetTopic, SetTopicId } from "./types";

export * from "./types";

// Topics built from sets. Signals, Acronyms and Radio move in here as they're converted.
export const SET_TOPICS: SetTopic[] = [
  {
    id: "surf-awareness",
    title: "Surf awareness",
    blurb: "Reading the water: types of waves, signs of a rip and the words for it all.",
    sets: SURF_AWARENESS_SETS,
  },
];

export const ALL_SETS: LearnSet[] = SET_TOPICS.flatMap((t) => t.sets);

export function getSetTopic(id: string): SetTopic | undefined {
  return SET_TOPICS.find((t) => t.id === id);
}

export function getSet(topic: string, slug: string): LearnSet | undefined {
  return getSetTopic(topic)?.sets.find((s) => s.slug === slug);
}

export function isSetTopic(id: string): id is SetTopicId {
  return SET_TOPICS.some((t) => t.id === id);
}
