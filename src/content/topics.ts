// The topics the app covers. The Topics pages, dashboard and daily practice all
// read from here so they stay in step. Each topic is built from sets
// (src/content/sets): one test per set and extra.

import { SET_TOPICS, setTests, topicHref, type SetTopicId } from "@/content/sets";

export type TopicId = SetTopicId;

export interface Topic {
  id: TopicId;
  title: string;
  blurb: string;
  href: string;
  setCount: number;
  testCount: number;
}

export const TOPICS: Topic[] = SET_TOPICS.map((t) => ({
  id: t.id,
  title: t.title,
  blurb: t.blurb,
  href: topicHref(t.id),
  setCount: t.sets.length,
  testCount: t.sets.reduce((n, s) => n + setTests(s).length, 0),
}));

export function getTopic(id: TopicId): Topic {
  return TOPICS.find((t) => t.id === id)!;
}
