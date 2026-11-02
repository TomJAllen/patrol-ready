import Link from "next/link";
import { TOPICS } from "@/content/topics";
import TopicIcon from "@/components/TopicIcon";

// All four topics, plus today's practice
export default function TopicsPage() {
  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-2">
        <h1 className="font-display text-4xl font-extrabold uppercase text-ink">Topics</h1>
        <p className="max-w-2xl text-stone-700">
          Quick refreshers for patrol, your Bronze Medallion and SRC, based on the SLSA Public Safety and Aquatic Rescue
          Training Manual (35th edition). Each topic is made of short sets: read the Learn page, then quiz yourself. Use
          them alongside your club training, not instead of it.
        </p>
      </header>
      <Link
        href="/test/daily"
        className="block rounded-lg border-2 border-ink bg-secondary p-5 shadow-[4px_4px_0_#1C1917] transition-[transform,box-shadow] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
      >
        <span className="font-display text-3xl font-extrabold uppercase text-ink">Today&apos;s practice →</span>
        <span className="mt-1 block text-ink">
          Five questions a day from across every topic, the same for everyone. A quick way to keep everything fresh.
        </span>
      </Link>
      <ul className="grid gap-4 md:grid-cols-2">
        {TOPICS.map((t) => (
          <li key={t.id}>
            <Link
              href={t.href}
              className="flex h-full flex-col rounded-lg border-2 border-ink bg-white p-5 shadow-[4px_4px_0_#1C1917] transition-[transform,box-shadow,background-color] hover:bg-secondary/30 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            >
              <span className="flex items-center gap-3">
                <TopicIcon topic={t.id} />
                <span className="font-display text-3xl font-extrabold uppercase leading-none text-ink">{t.title} →</span>
              </span>
              <span className="mt-2 flex-1 text-stone-700">{t.blurb}</span>
              <span className="mt-4 text-sm font-semibold text-stone-600">
                {t.setCount} sets · {t.testCount} tests
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
