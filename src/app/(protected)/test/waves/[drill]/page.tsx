import { notFound } from "next/navigation";
import WavesPractice from "@/components/drills/WavesPractice";
import { WAVE_DRILLS } from "@/content/waves";

export function generateStaticParams() {
  return WAVE_DRILLS.map((drill) => ({ drill }));
}

export default async function WavesDrillPage({ params }: { params: Promise<{ drill: string }> }) {
  const { drill } = await params;
  if (!(WAVE_DRILLS as readonly string[]).includes(drill)) notFound();
  return <WavesPractice initialTab={drill} />;
}
