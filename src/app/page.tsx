"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SignalTeaser from "@/components/SignalTeaser";
import { SIGNAL_INDEX, type SignalSummary } from "@/content/signalIndex";
import { getSetTopic, topicHref } from "@/content/sets";
import TopicIcon from "@/components/TopicIcon";

function SignalTile({ signal }: { signal: SignalSummary }) {
  return (
    <li className="flex flex-col items-center text-center">
      <div className="relative aspect-square w-full">
        <Image src={signal.imageUrl} alt="" fill sizes="(min-width: 768px) 140px, 30vw" className="object-contain mix-blend-multiply" />
      </div>
      <span className="mt-1 text-sm font-semibold leading-tight">{signal.name}</span>
    </li>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.svg" alt="" width={64} height={64} className="rounded-xl ring-[3px] ring-ink animate-pulse" />
      </div>
    );
  }

  const fromBeach = SIGNAL_INDEX.filter((s) => s.category === "beach-to-water");
  const fromWater = SIGNAL_INDEX.filter((s) => s.category === "water-to-beach");

  return (
    <div className="min-h-screen bg-white text-ink">
      {/* Hero: the patrol flag, edge to edge. Red half carries the words,
          yellow half carries a live question. */}
      <header className="md:bg-[linear-gradient(104deg,#DA291C_0_55%,#FFE135_55%_100%)]">
        <div className="mx-auto grid max-w-6xl md:grid-cols-[1.15fr_1fr] md:items-center">
          <div className="bg-primary px-5 pb-16 pt-[max(1.75rem,env(safe-area-inset-top))] text-white md:bg-transparent md:px-6 md:py-20">
            <div className="flex items-center gap-2 font-display text-2xl font-bold">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.svg" alt="" width={32} height={32} className="rounded-md ring-2 ring-ink" />
              Patrol Ready
            </div>

            <h1 className="mt-8 font-display text-6xl md:mt-10 font-extrabold uppercase leading-[0.9] sm:text-7xl lg:text-8xl">
              Brush up before your next patrol
            </h1>
            <p className="mt-6 max-w-md text-lg text-white/90">
              Quick refreshers on hand signals, the radio, first aid and reading the surf. A few
              minutes a day, alongside your Bronze, SRC and club training.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link href="/test/daily" className="btn-accent">
                Try today&apos;s practice
              </Link>
              <Link href="/signup" className="font-semibold underline decoration-2 underline-offset-4 hover:decoration-secondary">
                Create a free account
              </Link>
            </div>
            <p className="mt-4 text-sm text-white/80">
              No account needed.{" "}
              <Link href="/login" className="underline underline-offset-2 hover:text-white">
                Sign in
              </Link>{" "}
              to keep your progress across devices.
            </p>
          </div>

          <div className="-mt-10 bg-secondary px-5 pb-14 pt-16 [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)] md:m-0 md:bg-transparent md:p-10 md:[clip-path:none]">
            <div className="flex justify-center md:justify-end">
              <SignalTeaser />
            </div>
          </div>
        </div>
      </header>

      {/* The full set, grouped the way they're used on the beach */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-6 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-4xl font-extrabold uppercase leading-none md:text-5xl">
            All 14 signals
          </h2>
          <Link href="/learn/signals" className="font-semibold underline decoration-2 underline-offset-4 hover:decoration-primary">
            Learn what each one means
          </Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[8fr_6fr]">
          <div className="rounded-lg border-2 border-ink bg-sand p-5">
            <h3 className="font-display text-2xl font-bold uppercase">From the beach</h3>
            <p className="text-stone-700">To swimmers, lifesavers and craft in the water.</p>
            <ul className="mt-5 grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4">
              {fromBeach.map((s) => (
                <SignalTile key={s.name} signal={s} />
              ))}
            </ul>
          </div>
          <div className="rounded-lg border-2 border-ink bg-sea p-5 text-white">
            <h3 className="font-display text-2xl font-bold uppercase">From the water</h3>
            <p className="text-white/85">From a lifesaver in the water back to the beach.</p>
            <ul className="mt-5 grid grid-cols-3 gap-x-3 gap-y-5">
              {fromWater.map((s) => (
                <li key={s.name} className="flex flex-col items-center text-center">
                  <div className="relative aspect-square w-full rounded-md bg-white">
                    <Image src={s.imageUrl} alt="" fill sizes="(min-width: 768px) 140px, 30vw" className="object-contain p-1" />
                  </div>
                  <span className="mt-1 text-sm font-semibold leading-tight">{s.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* The four topics, each led by what it does for you */}
      <section className="border-t-[3px] border-ink bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-6 md:py-20">
          <h2 className="font-display text-4xl font-extrabold uppercase leading-none md:text-5xl">Four topics</h2>
          <p className="mt-2 max-w-2xl text-stone-700">
            Each one is made of short sets: read the Learn page, then quiz yourself.
          </p>
          <div className="mt-10 grid gap-12 md:grid-cols-2 md:gap-10 lg:grid-cols-4 lg:gap-8">
            {(
              [
                {
                  topic: "communication",
                  title: "Signal and call with confidence",
                  body: "All 14 hand signals, with a camera check as you perform them, plus prowords, the phonetic alphabet, call signs and the 4 Ps.",
                },
                {
                  topic: "first-aid",
                  title: "Know what to ask and do",
                  body: "DRSABCD, CPR, SAMPLE, IMIST AMBO and more, plus choking, marine stings and head injuries.",
                },
                {
                  topic: "surf-awareness",
                  title: "Read the water",
                  body: "How waves break and why it matters, the signs of a rip, and the words for it all.",
                },
                {
                  topic: "patrol",
                  title: "Run a safe patrol",
                  body: "What each beach flag means, being fit for patrol, giving feedback and staying warm in the water.",
                },
              ] as const
            ).map((f) => (
              <div key={f.topic} className="flex flex-col">
                <TopicIcon topic={f.topic} />
                <p className="mt-3 text-sm font-bold uppercase tracking-widest text-primary">{getSetTopic(f.topic)!.title}</p>
                <h3 className="mt-1 font-display text-3xl font-extrabold uppercase leading-none text-ink">{f.title}</h3>
                <p className="mt-3 flex-1 text-stone-700">{f.body}</p>
                <Link
                  href={topicHref(f.topic)}
                  className="mt-4 self-start font-semibold underline decoration-2 underline-offset-4 hover:decoration-primary"
                >
                  Open {getSetTopic(f.topic)!.title.toLowerCase()} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-12 md:px-6">
        <div className="rounded-lg border-2 border-dashed border-ink bg-white p-5 text-stone-700">
          <p className="font-display text-xl font-bold uppercase text-ink">A refresher, not a course</p>
          <p className="mt-1">
            Patrol Ready helps you keep the basics fresh between training sessions and patrols. It doesn&apos;t
            replace your club training, your trainers and assessors, or the SLSA manual. Where anything here
            differs from what you&apos;ve been taught, go with your training.
          </p>
        </div>
      </section>

      <section className="bg-ink text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 md:px-6">
          <div className="flex items-center gap-2 font-display text-xl font-bold">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="" width={28} height={28} className="rounded-md" />
            Patrol Ready
          </div>
          <Link href="/topics" className="btn-secondary">
            See the topics
          </Link>
        </div>
      </section>
    </div>
  );
}
