import type { SetTopicId } from "@/content/sets";

// Each topic's colour, used for its icon tile and its tag in History
export const TOPIC_STYLE: Record<SetTopicId, string> = {
  communication: "bg-primary text-white",
  "first-aid": "bg-correct text-white",
  "surf-awareness": "bg-sea text-white",
  patrol: "bg-sand text-ink",
};

function Glyph({ topic }: { topic: SetTopicId }) {
  switch (topic) {
    // Handheld radio
    case "communication":
      return (
        <>
          <path d="M9 2v5" />
          <rect x="6" y="7" width="12" height="15" rx="2" />
          <path d="M9 11h6M9 14h6M9 17h3" />
        </>
      );
    // First aid kit (white cross on green, the first aid sign)
    case "first-aid":
      return (
        <>
          <path d="M9 6V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V6" />
          <rect x="3" y="6" width="18" height="14" rx="2" />
          <path d="M12 9.5v7M8.5 13h7" />
        </>
      );
    // A breaking wave
    case "surf-awareness":
      return (
        <>
          <path d="M2 17c2 0 3-1.5 5-1.5S10 17 12 17s3-1.5 5-1.5 3 1.5 5 1.5" />
          <path d="M3 13c1-4 4-7 8.5-7 3 0 5 1.8 5 4.2 0 1.8-1.4 3-3 3-1.4 0-2.4-1-2.4-2.2" />
        </>
      );
    // Red and yellow patrol flag
    case "patrol":
      return (
        <>
          <path d="M5 22V3" />
          <path d="M5 4h14v6H5z" fill="#DA291C" stroke="#DA291C" />
          <path d="M5 10h14v6H5z" fill="#FFE135" />
          <path d="M5 4h14v12H5" />
        </>
      );
  }
}

// A topic's icon on its coloured tile
export default function TopicIcon({ topic, size = "md" }: { topic: SetTopicId; size?: "sm" | "md" | "lg" }) {
  const box = size === "sm" ? "h-8 w-8 p-1.5" : size === "lg" ? "h-14 w-14 p-2.5" : "h-11 w-11 p-2";
  return (
    <span aria-hidden="true" className={`inline-flex shrink-0 items-center justify-center rounded-md border-2 border-ink ${box} ${TOPIC_STYLE[topic]}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
        <Glyph topic={topic} />
      </svg>
    </span>
  );
}
