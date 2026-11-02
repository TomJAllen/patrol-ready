"use client";

import { useState } from "react";
import { CALL_SCENARIOS } from "@/content/radio";
import OrderDrill from "@/components/drills/OrderDrill";

// Pick a scenario, then put the radio exchange in order
export default function BuildCallDrill() {
  const [scenario, setScenario] = useState(CALL_SCENARIOS[0].slug);
  const s = CALL_SCENARIOS.find((c) => c.slug === scenario)!;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {CALL_SCENARIOS.map((c) => (
          <button
            key={c.slug}
            onClick={() => setScenario(c.slug)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
              scenario === c.slug ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {c.title}
          </button>
        ))}
      </div>
      <p className="text-gray-700 font-medium">{s.situation}</p>
      <OrderDrill
        key={s.slug}
        instructions="Put the radio exchange in the right order."
        trackAs={{ drill: "radio_build_call", item: s.slug }}
        items={s.lines.map((l) => ({ label: l.text, tag: l.from === "you" ? "You" : "Them" }))}
      />
    </div>
  );
}
