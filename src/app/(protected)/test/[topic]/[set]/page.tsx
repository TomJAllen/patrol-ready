import { notFound, redirect } from "next/navigation";
import SetQuiz from "@/components/drills/SetQuiz";
import { SET_TOPICS, getSet, getSetTopic, testHref } from "@/content/sets";

export function generateStaticParams() {
  return SET_TOPICS.flatMap((t) => [...t.sets.filter((s) => s.questions.length).map((s) => ({ topic: t.id, set: s.slug })), { topic: t.id, set: "mixed" }]);
}

export default async function SetQuizPage({ params }: { params: Promise<{ topic: string; set: string }> }) {
  const { topic, set } = await params;
  const found = getSet(topic, set);
  if (!getSetTopic(topic) || (set !== "mixed" && !found)) notFound();
  if (found && !found.questions.length) redirect(testHref(found));
  return <SetQuiz topic={topic} set={set} />;
}
