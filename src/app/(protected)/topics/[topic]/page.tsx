import { notFound } from "next/navigation";
import TopicPage from "@/components/TopicPage";
import { SET_TOPICS, isSetTopic } from "@/content/sets";

export function generateStaticParams() {
  return SET_TOPICS.map((t) => ({ topic: t.id }));
}

export default async function TopicRoute({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  if (!isSetTopic(topic)) notFound();
  return <TopicPage topic={topic} />;
}
