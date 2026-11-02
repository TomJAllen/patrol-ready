import Link from "next/link";
import { TOPICS } from "@/content/topics";
import { SET_TOPICS } from "@/content/sets";

// Up to five set names per topic, shown as tags
const TAGS: Record<string, string[]> = Object.fromEntries(SET_TOPICS.map((t) => [t.id, t.sets.slice(0, 5).map((s) => s.title)]));

export default function LearnHubPage() {
  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Learn</h1>
        <p className="text-gray-600 max-w-2xl">
          Quick refreshers on the communication, first aid, surf awareness and patrol skills you use on patrol and in your Bronze Medallion and
          SRC, based on the SLSA Public Safety and Aquatic Rescue Training Manual (35th edition). Use them alongside
          your club training and the manual, not instead of them.
        </p>
      </header>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TOPICS.map((t) => (
          <div key={t.id} className="card flex flex-col gap-3 border-2 border-transparent hover:border-secondary transition-all">
            <Link href={t.learnHref} className="space-y-2 flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{t.title} →</h2>
              <p className="text-gray-600">{t.blurb}</p>
              <div className="flex flex-wrap gap-1 pt-1">
                {TAGS[t.id].map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-bold text-gray-600">{tag}</span>
                ))}
              </div>
            </Link>
            <div className="pt-2 border-t border-gray-100">
              <Link href={t.testHref} className="text-sm font-bold text-primary hover:underline">
                Test your {t.title.toLowerCase()} ({t.exercises.filter((e) => e.href).length} tests) →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
