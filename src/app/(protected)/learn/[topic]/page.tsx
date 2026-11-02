import Link from "next/link";
import { notFound } from "next/navigation";
import TrackView from "@/components/TrackView";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SET_TOPICS, getSetTopic, learnHref } from "@/content/sets";
import TopicIcon from "@/components/TopicIcon";

// Learn page for a topic built from sets: one card per set.
// Hand signals has its own page (/learn/signals); the card links there.
export function generateStaticParams() {
  return SET_TOPICS.map((t) => ({ topic: t.id }));
}

export default async function LearnTopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic: id } = await params;
  const topic = getSetTopic(id);
  if (!topic) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <TrackView event="learn_viewed" props={{ area: topic.id }} />
      <Breadcrumbs trail={[{ href: "/learn", label: "Learn" }]} />
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <TopicIcon topic={topic.id} size="lg" />
          <h1 className="text-3xl font-bold text-gray-900">{topic.title}</h1>
        </div>
        <p className="text-gray-600">{topic.blurb}</p>
        <Link href={`/test/${topic.id}/mixed`} className="btn-primary inline-block">
          Test yourself on all of {topic.title.toLowerCase()}
        </Link>
      </header>
      <ul className="grid gap-4 sm:grid-cols-2">
        {topic.sets.map((s) => (
          <li key={s.slug}>
            <Link
              href={learnHref(s)}
              className="card flex h-full flex-col gap-2 border-2 border-transparent transition-all hover:border-secondary"
            >
              <span className="text-xl font-bold text-gray-900">{s.title} →</span>
              <span className="flex-1 text-sm text-gray-600">{s.purpose}</span>
              <span className="text-xs font-bold uppercase tracking-wide text-gray-500">{s.count ?? s.items.length} to learn</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
