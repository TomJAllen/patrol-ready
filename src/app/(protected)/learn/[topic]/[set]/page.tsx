import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import TrackView from "@/components/TrackView";
import Breadcrumbs from "@/components/Breadcrumbs";
import SetVisual from "@/components/SetVisual";
import RadioCallsLearn from "@/components/RadioCallsLearn";
import { SET_TOPICS, getSet, getSetTopic, testHref, topicHref } from "@/content/sets";

// Learn page for one set, generated from its content
export function generateStaticParams() {
  return SET_TOPICS.flatMap((t) => t.sets.filter((s) => !s.learnHref).map((s) => ({ topic: t.id, set: s.slug })));
}

export default async function LearnSetPage({ params }: { params: Promise<{ topic: string; set: string }> }) {
  const { topic: topicId, set: slug } = await params;
  const topic = getSetTopic(topicId);
  const set = getSet(topicId, slug);
  if (!topic || !set) notFound();
  if (set.learnHref) redirect(set.learnHref);
  const hasVisuals = set.items.some((i) => i.visual);
  const List = set.ordered ? "ol" : "ul";

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <TrackView event="learn_viewed" props={{ area: topic.id, set: set.slug }} />
      <Breadcrumbs trail={[{ href: "/topics", label: "Topics" }, { href: topicHref(topic.id), label: topic.title }]} />
      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-gray-900">{set.title}</h1>
        <p className="text-gray-600">{set.purpose}</p>
        <Link href={testHref(set)} className="btn-primary inline-block">
          Test yourself
        </Link>
      </header>

      {set.whenToUse && (
        <section className="card space-y-2">
          <h2 className="text-xl font-bold text-gray-900">When you&apos;ll use it</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {set.whenToUse.map((w) => <li key={w}>{w}</li>)}
          </ul>
        </section>
      )}

      {(set.items.length > 0 || set.intro || set.visual) && (
      <section className="card space-y-4">
        {set.intro && <p className="text-sm text-gray-700">{set.intro}</p>}
        {set.visual && <SetVisual name={set.visual} />}
        <List className="space-y-5">
          {set.items.map((it, i) => (
            <li key={it.id} className={hasVisuals ? "grid gap-4 sm:grid-cols-[12rem_1fr] items-start" : "flex gap-3"}>
              {it.visual ? (
                <SetVisual name={it.visual} />
              ) : (
                (set.ordered || it.letter) && (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary font-black text-white">
                    {it.letter ?? i + 1}
                  </span>
                )
              )}
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900">
                  {it.term}
                  {it.aka && <span className="block text-sm font-semibold text-gray-500">{it.aka}</span>}
                </h3>
                {it.meaning && <p className="text-gray-700">{it.meaning}</p>}
                {it.details?.map((d) => (
                  <p key={d.label} className="text-sm text-gray-700">
                    <strong className="text-gray-900">{d.label}:</strong> {d.text}
                  </p>
                ))}
              </div>
            </li>
          ))}
        </List>
      </section>
      )}

      {set.learnSection === "radio-calls" && <RadioCallsLearn />}

      {set.notes?.map((n) => (
        <section key={n.title} className="card space-y-2">
          <h2 className="text-xl font-bold text-gray-900">{n.title}</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {n.points.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </section>
      ))}

      <p className="text-xs text-gray-500">Source: {set.source}</p>
    </div>
  );
}
