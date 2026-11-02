import { notFound } from "next/navigation";
import TopicTests from "@/components/TopicTests";
import { SET_TOPICS, isSetTopic } from "@/content/sets";

export function generateStaticParams() {
  return SET_TOPICS.map((t) => ({ topic: t.id }));
}

export default async function TestTopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  if (!isSetTopic(topic)) notFound();
  return <TopicTests topic={topic} />;
}
