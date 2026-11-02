import { notFound } from "next/navigation";
import SetExtra from "@/components/drills/SetExtra";
import { SET_TOPICS, getSet, type ExtraKey } from "@/content/sets";

// Spell it, Build the call and Match (Identify and Perform have their own pages)
const ROUTED: ExtraKey[] = ["spell", "build-call", "match"];

export function generateStaticParams() {
  return SET_TOPICS.flatMap((t) =>
    t.sets.flatMap((s) => (s.extras ?? []).filter((e) => ROUTED.includes(e)).map((extra) => ({ topic: t.id, set: s.slug, extra })))
  );
}

export default async function SetExtraPage({ params }: { params: Promise<{ topic: string; set: string; extra: string }> }) {
  const { topic, set: slug, extra } = await params;
  const set = getSet(topic, slug);
  if (!set || !ROUTED.includes(extra as ExtraKey) || !set.extras?.includes(extra as ExtraKey)) notFound();
  return <SetExtra topic={topic} set={slug} extra={extra as ExtraKey} />;
}
