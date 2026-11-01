// Waves: how they form, the three ways they break, and the words used to describe
// them. Based on the surf awareness content in the SLSA Public Safety and Aquatic
// Rescue Training Manual, 35th edition, in our own words.

export type WaveTypeId = "spilling" | "plunging" | "surging";

export interface WaveType {
  id: WaveTypeId;
  name: string;
  aka?: string;
  bottom: string; // the seabed / beach shape that makes it
  looks: string; // what you see
  risk: string; // why it matters on patrol
}

export const WAVE_TYPES: WaveType[] = [
  {
    id: "spilling",
    name: "Spilling",
    bottom: "A gently sloping seabed, so the water gets shallower slowly.",
    looks: "The top of the wave crumbles and tumbles down its face as white water. It breaks gradually over a long distance.",
    risk: "The safest for swimming and learning to bodysurf. Because the surf zone is wide, swimmers can end up a long way out, and there's more water moving that can feed rips.",
  },
  {
    id: "plunging",
    name: "Plunging",
    aka: "Dumpers, when they break close to shore",
    bottom: "A sudden change in depth: a steep beach, a sandbank or a reef.",
    looks: "The top curls right over and crashes down in front of the wave, often forming a tube, and breaks with a lot of force in one go.",
    risk: "Can throw swimmers and bodyboarders into the sand, causing neck, spinal and shoulder injuries, or winding them. Never dive into them in shallow water.",
  },
  {
    id: "surging",
    name: "Surging",
    bottom: "Deep water right up to the shore: very steep beaches and rocks.",
    looks: "The wave doesn't really break. It surges up the beach or rocks, then rushes back down.",
    risk: "The strong backwash can knock people off their feet and drag them into deep water. Especially dangerous around rock platforms.",
  },
];

export function getWaveType(id: WaveTypeId): WaveType {
  return WAVE_TYPES.find((w) => w.id === id)!;
}

export interface WaveTerm {
  term: string;
  meaning: string;
}

// Kept to one meaning each, so the term quiz always has a single right answer
export const WAVE_TERMS: WaveTerm[] = [
  { term: "Crest", meaning: "The highest point of a wave." },
  { term: "Trough", meaning: "The lowest point between two waves." },
  { term: "Wave height", meaning: "The vertical distance from the trough to the crest." },
  { term: "Wavelength", meaning: "The distance from one crest to the next." },
  { term: "Wave period", meaning: "The time between two crests passing the same point." },
  { term: "Set", meaning: "A group of bigger waves arriving one after another." },
  { term: "Lull", meaning: "A calmer spell between sets." },
  { term: "Swell", meaning: "Waves made by wind far away: regular, evenly spaced and long-period." },
  { term: "Wind waves", meaning: "Waves made by local wind: short, choppy and irregular. Also called sea or chop." },
  { term: "Fetch", meaning: "The distance of open water the wind blows over to make waves." },
  { term: "White water", meaning: "The foam left once a wave has broken." },
  { term: "Backwash", meaning: "Water running back down the beach after a wave has washed up it." },
  { term: "Shore break", meaning: "Waves breaking right at the water's edge, often hard and dumping." },
];

// How waves form, in order
export const WAVE_FORMATION = [
  "Wind blowing across the sea pushes the surface into waves.",
  "The size of the waves depends on how strong the wind is, how long it blows and how far it blows over open water (the fetch).",
  "Waves travel a long way from where they form. As they move away from the wind they sort themselves into regular swell, which is why big surf can turn up on a calm, sunny day.",
  "As a wave reaches shallow water, the bottom of it slows down while the top keeps going. The wave gets steeper until the top topples over and it breaks.",
  "How it breaks depends on the shape of the seabed: gentle slopes make spilling waves, sudden changes make plunging waves, and deep water to the shore makes surging waves.",
];

export const WAVE_PATROL_TIPS = [
  "Watch the water for a few minutes before you go in, to see how big the sets are and how long the lulls last",
  "Time your entry and exit for a lull",
  "Dive under breaking waves (or duck-dive your board) rather than standing in front of them",
  "Never dive head-first into shallow water or a wave breaking in the shallows",
  "On a dumping beach, warn swimmers and be ready for neck and back injuries",
  "Conditions change with the tide: a beach that spills at high tide can dump at low tide",
];

// "Which type of wave?" questions: read a description, pick spilling, plunging or surging
export interface WaveTypeQuestion {
  id: string;
  prompt: string;
  answer: WaveTypeId;
  explain: string;
}

export const WAVE_TYPE_QUESTIONS: WaveTypeQuestion[] = [
  {
    id: "gentle-slope",
    prompt: "The beach shelves very gradually and the waves crumble into white water a long way out.",
    answer: "spilling",
    explain: "A gentle slope lets the wave break slowly, crumbling down its face: a spilling wave.",
  },
  {
    id: "tube",
    prompt: "The wave stands up steeply, the lip throws out and it forms a hollow tube before crashing down.",
    answer: "plunging",
    explain: "A curling lip and a tube are the signs of a plunging wave, caused by a sudden change in depth.",
  },
  {
    id: "rock-platform",
    prompt: "At a rock platform, the water doesn't break but rushes up the rocks and then pours back off them.",
    answer: "surging",
    explain: "With deep water right to the edge, waves surge up and drain back without properly breaking.",
  },
  {
    id: "spinal",
    prompt: "Which type of wave is most likely to drive a bodysurfer into the sand and cause a spinal injury?",
    answer: "plunging",
    explain: "Plunging waves, and dumpers close to shore, break with great force in shallow water.",
  },
  {
    id: "learners",
    prompt: "Which type of wave is usually best for beginners learning to bodysurf?",
    answer: "spilling",
    explain: "Spilling waves are gentle and break gradually, so they're the safest to learn in.",
  },
  {
    id: "backwash",
    prompt: "Which type of wave is known for strong backwash that can knock people over and drag them into deep water?",
    answer: "surging",
    explain: "Surging waves rush back down steep beaches and rocks, pulling people with them.",
  },
  {
    id: "sandbank",
    prompt: "Swell hits a shallow sandbank with deeper water just in front of it.",
    answer: "plunging",
    explain: "A sudden change in depth, like a sandbank or reef, makes waves plunge.",
  },
  {
    id: "steep-shore",
    prompt: "A very steep beach drops straight into deep water, and waves slide up the sand without breaking.",
    answer: "surging",
    explain: "Deep water right up to a steep shore means waves surge rather than break.",
  },
  {
    id: "wide-surf-zone",
    prompt: "Several lines of white water roll in across a wide surf zone, slowly getting smaller.",
    answer: "spilling",
    explain: "Spilling waves break over a long distance, leaving lots of rolling white water.",
  },
  {
    id: "shore-dump",
    prompt: "Waves are slamming down hard right at the water's edge, at low tide on a steep beach.",
    answer: "plunging",
    explain: "That's shore break, or dumpers: plunging waves breaking in very shallow water.",
  },
];

// The waves tests, in the order they're listed (each has its own page: /test/waves/<id>)
export const WAVE_DRILLS = ["types", "terms"] as const;
export type WaveDrill = (typeof WAVE_DRILLS)[number];
