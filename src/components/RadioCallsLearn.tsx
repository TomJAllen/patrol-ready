import { CALL_SCENARIOS, RADIO_DONTS, RADIO_TECHNIQUE, READABILITY } from "@/content/radio";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card space-y-3">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

// The Learn page body for the Radio calls set
export default function RadioCallsLearn() {
  return (
    <>
      <Section title="Making a call">
        <ol className="list-decimal list-inside space-y-1 text-gray-700">
          <li>Say the call sign of the station you want, <strong>twice</strong>.</li>
          <li>Then say <strong>&ldquo;this is&rdquo;</strong> and your own call sign.</li>
          <li>End with <strong>&ldquo;Over&rdquo;</strong> and wait for them to reply &ldquo;Go ahead&rdquo; before giving your message.</li>
          <li>Once you&apos;re talking, you don&apos;t need to repeat call signs on every transmission.</li>
        </ol>
        <p className="font-mono text-sm bg-gray-50 rounded-lg p-3 text-gray-800">
          &ldquo;SurfCom, SurfCom, this is Bondi Patrol. Over.&rdquo;
        </p>
        <h3 className="font-bold text-gray-900 pt-2">Radio checks</h3>
        <p className="text-gray-700 text-sm">Only do a radio check if you think your equipment is faulty. Reply with how well you hear them:</p>
        <dl className="grid sm:grid-cols-3 gap-2">
          {READABILITY.map((r) => (
            <div key={r.term} className="bg-gray-50 rounded-lg p-3">
              <dt className="font-bold text-gray-900">{r.term}</dt>
              <dd className="text-sm text-gray-600">{r.meaning}</dd>
            </div>
          ))}
        </dl>
        <h3 className="font-bold text-gray-900 pt-2">Emergencies</h3>
        <p className="text-gray-700 text-sm">
          For a life-threatening incident, or anything beyond your patrol (such as a mass rescue), clear the channel
          by calling <strong>&ldquo;Rescue, Rescue, Rescue&rdquo;</strong>, then your call to the communication centre. They&apos;ll
          tell all other stations to stand by, and announce to &ldquo;All stations&rdquo; when it&apos;s over.
        </p>
      </Section>

      <Section title="Good radio technique">
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {RADIO_TECHNIQUE.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </Section>

      <Section title="Example calls">
        <div className="space-y-6">
          {CALL_SCENARIOS.map((s) => (
            <div key={s.slug} className="space-y-2">
              <h3 className="font-bold text-gray-900">{s.title}</h3>
              <p className="text-sm text-gray-600">{s.situation}</p>
              <div className="space-y-2">
                {s.lines.map((l, i) => (
                  <p
                    key={i}
                    className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                      l.from === "you" ? "ml-auto bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {l.text}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Don'ts">
        <p className="text-gray-700 text-sm">Lots of people listen to radio channels. Never:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {RADIO_DONTS.map((d) => <li key={d}>{d}</li>)}
        </ul>
      </Section>
    </>
  );
}
