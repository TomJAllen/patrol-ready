import Link from "next/link";
import TrackView from "@/components/TrackView";
import Breadcrumbs from "@/components/Breadcrumbs";
import { WaveAnatomy, WaveTypeProfile } from "@/components/WaveDiagram";
import { WAVE_FORMATION, WAVE_PATROL_TIPS, WAVE_TERMS, WAVE_TYPES } from "@/content/waves";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="card space-y-3 scroll-mt-24">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

const SECTIONS = [
  ["types", "Types of waves"],
  ["parts", "Parts of a wave"],
  ["formation", "How waves form"],
  ["terms", "Words to know"],
  ["on-patrol", "On patrol"],
];

export default function WavesPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <TrackView event="learn_viewed" props={{ area: "waves" }} />
      <Breadcrumbs trail={[{ href: "/learn", label: "Learn" }]} />
      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-gray-900">Waves</h1>
        <p className="text-gray-600">
          The three ways waves break, what makes each one, and why it matters for the people you&apos;re watching.
          Reading the waves is part of reading the beach: the same beach can change through the day as the tide moves.
        </p>
        <Link href="/test/waves/types" className="btn-primary inline-block">
          Test yourself on wave types
        </Link>
        <div className="flex flex-wrap gap-2 pt-2">
          {SECTIONS.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="px-3 py-1.5 rounded-full bg-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-200">
              {label}
            </a>
          ))}
        </div>
      </header>

      <Section id="types" title="The three types of waves">
        <p className="text-gray-700 text-sm">
          How a wave breaks depends mostly on the shape of the seabed. In each drawing the shore is on the right.
        </p>
        <div className="space-y-6">
          {WAVE_TYPES.map((w) => (
            <div key={w.id} className="grid sm:grid-cols-[12rem_1fr] gap-4 items-start">
              <WaveTypeProfile type={w.id} />
              <div className="space-y-1.5">
                <h3 className="font-bold text-gray-900 text-lg">
                  {w.name}
                  {w.aka && <span className="block text-sm font-semibold text-gray-500">{w.aka}</span>}
                </h3>
                <p className="text-gray-700 text-sm"><strong className="text-gray-900">Where:</strong> {w.bottom}</p>
                <p className="text-gray-700 text-sm"><strong className="text-gray-900">Looks like:</strong> {w.looks}</p>
                <p className="text-gray-700 text-sm"><strong className="text-gray-900">Watch for:</strong> {w.risk}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="parts" title="Parts of a wave">
        <WaveAnatomy />
        <p className="text-gray-700 text-sm">
          Wave height is measured from the trough to the crest. Wavelength is the distance between crests, and the
          wave period is the time between them.
        </p>
      </Section>

      <Section id="formation" title="How waves form and break">
        <ol className="list-decimal list-inside space-y-1.5 text-gray-700">
          {WAVE_FORMATION.map((t) => <li key={t}>{t}</li>)}
        </ol>
      </Section>

      <Section id="terms" title="Words to know">
        <dl className="divide-y divide-gray-100">
          {WAVE_TERMS.map((t) => (
            <div key={t.term} className="py-2 grid grid-cols-[8rem_1fr] gap-3">
              <dt className="font-bold text-gray-900">{t.term}</dt>
              <dd className="text-gray-700">{t.meaning}</dd>
            </div>
          ))}
        </dl>
        <Link href="/test/waves/terms" className="text-primary font-semibold hover:underline text-sm">
          Test yourself on wave words →
        </Link>
      </Section>

      <Section id="on-patrol" title="On patrol">
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {WAVE_PATROL_TIPS.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </Section>

      <p className="text-xs text-gray-500">
        Source: SLSA Public Safety and Aquatic Rescue Training Manual, 35th ed., surf awareness. Summarised in our own
        words; diagrams are our own simplified drawings.
      </p>
    </div>
  );
}
