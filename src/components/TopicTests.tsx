import Link from "next/link";
import { getSetTopic, setTests, learnHref, type SetTopicId } from "@/content/sets";
import Breadcrumbs from "@/components/Breadcrumbs";

// The Test page for a topic: one card per set with its tests, then the mixed quiz
export default function TopicTests({ topic }: { topic: SetTopicId }) {
  const t = getSetTopic(topic)!;
  return (
    <div className="space-y-8 pb-12">
      <Breadcrumbs trail={[{ href: "/test", label: "Test" }]} />
      <header className="space-y-2">
        <h1 className="font-display text-4xl font-extrabold uppercase text-ink">Test your {t.title.toLowerCase()}</h1>
        <p className="text-stone-700">
          {t.blurb} Need a refresher?{" "}
          <Link href={`/learn/${t.id}`} className="font-semibold text-primary hover:underline">
            Learn {t.title.toLowerCase()}
          </Link>
        </p>
      </header>
      <Link
        href={`/test/${t.id}/mixed`}
        className="block rounded-lg border-2 border-ink bg-secondary p-4 shadow-[3px_3px_0_#1C1917] transition-[transform,box-shadow] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
      >
        <span className="font-display text-2xl font-bold text-ink">All of {t.title.toLowerCase()} →</span>
        <span className="mt-1 block text-sm text-ink">A mix from every set, plus what each one is for.</span>
      </Link>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {t.sets.map((set) => (
          <li key={set.slug} className="flex flex-col rounded-lg border-2 border-ink bg-white p-4 shadow-[3px_3px_0_#1C1917]">
            <p className="font-display text-2xl font-bold leading-tight text-ink">{set.title}</p>
            <p className="mt-1 flex-1 text-sm text-stone-700">{set.purpose}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {setTests(set).map((test, i) => (
                <Link
                  key={test.href}
                  href={test.href}
                  title={test.description}
                  className={`${i === 0 ? "btn-primary" : "btn-outline"} px-3 py-1.5 text-sm`}
                >
                  {test.label}
                </Link>
              ))}
              <Link href={learnHref(set)} className="px-2 py-1.5 text-sm font-semibold text-primary hover:underline">
                Learn
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
