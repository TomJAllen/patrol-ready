import { LEVEL_LABEL, type Level } from "@/lib/progress";
import type { SegmentState } from "@/lib/topicProgress";

const LEVEL_STYLE: Record<Level, string> = {
  "not-started": "border-dashed border-stone-400 text-stone-600 bg-white",
  learning: "border-ink bg-secondary text-ink",
  ready: "border-correct bg-green-50 text-correct",
  "patrol-ready": "border-ink bg-correct text-white",
};

// "In training", "Shadow patrolling", "✓ Patrol-ready"
export function LevelBadge({ level }: { level: Level }) {
  return (
    <span className={`rounded border-2 px-2 py-0.5 text-xs font-bold leading-tight ${LEVEL_STYLE[level]}`}>
      {level === "patrol-ready" && "✓ "}
      {LEVEL_LABEL[level]}
    </span>
  );
}

// A row of segments, one per set: green passed, yellow started, white not yet
export function Segments({ states, label }: { states: SegmentState[]; label: string }) {
  return (
    <div className="flex gap-1" role="img" aria-label={label}>
      {states.map((st, i) => (
        <span
          key={i}
          className={`h-3 flex-1 rounded-sm border border-ink ${
            st === "done" ? "bg-correct" : st === "started" ? "bg-secondary" : "bg-white"
          }`}
        />
      ))}
    </div>
  );
}
