// The topics the app covers, and the tests for each. Learn, Test and the
// dashboard all read from here so they stay in step. Each topic is built from
// sets (src/content/sets): one test per set and extra, plus a mixed quiz.

import { SET_TOPICS, setTests, type SetTopicId } from "@/content/sets";

export type TopicId = SetTopicId;

export interface Exercise {
  title: string;
  description: string;
  href?: string;
}

export interface Topic {
  id: TopicId;
  title: string;
  blurb: string;
  learnHref: string;
  testHref: string;
  exercises: Exercise[];
}

export const TOPICS: Topic[] = SET_TOPICS.map((t) => ({
  id: t.id,
  title: t.title,
  blurb: t.blurb,
  learnHref: `/learn/${t.id}`,
  testHref: `/test/${t.id}`,
  exercises: [
    ...t.sets.flatMap((set) =>
      setTests(set).map((test) => ({
        title: test.label === "Quiz" ? set.title : `${set.title}: ${test.label}`,
        description: test.description,
        href: test.href,
      }))
    ),
    { title: `All of ${t.title.toLowerCase()}`, description: "A mix from every set, plus what each one is for.", href: `/test/${t.id}/mixed` },
  ],
}));

export function getTopic(id: TopicId): Topic {
  return TOPICS.find((t) => t.id === id)!;
}
