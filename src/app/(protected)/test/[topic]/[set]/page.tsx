import { notFound } from "next/navigation";
import SetQuiz from "@/components/drills/SetQuiz";
import { SET_TOPICS, getSet, getSetTopic } from "@/content/sets";

export function generateStaticParams() {
  return SET_TOPICS.flatMap((t) => [...t.sets.map((s) => ({ topic: t.id, set: s.slug })), { topic: t.id, set: "mixed" }]);
}

export default async function SetQuizPage({ params }: { params: Promise<{ topic: string; set: string }> }) {
  const { topic, set } = await params;
  if (!getSetTopic(topic) || (set !== "mixed" && !getSet(topic, set))) notFound();
  return <SetQuiz topic={topic} set={set} />;
}
