import { notFound, redirect } from "next/navigation";
import SetQuiz from "@/components/drills/SetQuiz";
import { SET_TOPICS, QUICK_QUIZ_SIZES, getSet, getSetTopic, testHref } from "@/content/sets";

export function generateStaticParams() {
  return SET_TOPICS.flatMap((t) => [...t.sets.filter((s) => s.questions.length).map((s) => ({ topic: t.id, set: s.slug })), { topic: t.id, set: "mixed" }]);
}

export default async function SetQuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ topic: string; set: string }>;
  searchParams: Promise<{ n?: string }>;
}) {
  const { topic, set } = await params;
  const found = getSet(topic, set);
  if (!getSetTopic(topic) || (set !== "mixed" && !found)) notFound();
  if (found && !found.questions.length) redirect(testHref(found));
  // Quick quiz size: 5, 10 or 15 (10 if anything else)
  const n = Number((await searchParams).n);
  const size = (QUICK_QUIZ_SIZES as readonly number[]).includes(n) ? n : 10;
  return <SetQuiz topic={topic} set={set} size={size} />;
}
