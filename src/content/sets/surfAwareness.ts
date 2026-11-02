// Surf awareness: reading the beach and the water. From the surf awareness content
// in the SLSA Public Safety and Aquatic Rescue Training Manual, 35th edition, in
// our own words.

import type { LearnSet } from "./types";

const SOURCE = "SLSA Public Safety and Aquatic Rescue Training Manual, 35th ed., surf awareness. Summarised in our own words.";

export const TYPES_OF_WAVES: LearnSet = {
  slug: "types-of-waves",
  topic: "surf-awareness",
  title: "Types of waves",
  purpose: "Recognising how waves are breaking, and what that means for the people in the water.",
  whenToUse: [
    "Checking conditions before setting up the flags",
    "Deciding whether to warn swimmers about dumping waves",
    "Choosing where and when to enter the water",
  ],
  intro: "How a wave breaks depends mostly on the shape of the seabed. In each drawing the shore is on the right.",
  items: [
    {
      id: "spilling",
      term: "Spilling",
      meaning: "The top crumbles down the face as white water, breaking gradually over a long distance.",
      visual: "wave-spilling",
      details: [
        { label: "Where", text: "A gently sloping seabed." },
        { label: "Watch for", text: "The safest to swim and learn in, but the wide surf zone means swimmers can drift a long way out." },
      ],
    },
    {
      id: "plunging",
      term: "Plunging",
      aka: "Dumpers, when they break close to shore",
      meaning: "The top curls over and crashes down in front of the wave, often forming a tube.",
      visual: "wave-plunging",
      details: [
        { label: "Where", text: "A sudden change in depth: a steep beach, sandbank or reef." },
        { label: "Watch for", text: "Can drive people into the sand, causing neck, spinal and shoulder injuries. Never dive into them in shallow water." },
      ],
    },
    {
      id: "surging",
      term: "Surging",
      meaning: "The wave doesn't really break: it surges up the beach or rocks, then rushes back down.",
      visual: "wave-surging",
      details: [
        { label: "Where", text: "Deep water right up to the shore: very steep beaches and rocks." },
        { label: "Watch for", text: "Strong backwash can knock people over and drag them into deep water, especially around rock platforms." },
      ],
    },
  ],
  questions: ["picture", "scenario", "meaning"],
  prompts: { meaning: "Which describes a {term} wave?" },
  scenarios: [
    { id: "gentle-slope", prompt: "The beach shelves very gradually and the waves crumble into white water a long way out.", answer: "spilling", explain: "A gentle slope lets the wave break slowly, crumbling down its face." },
    { id: "tube", prompt: "The wave stands up steeply, the lip throws out and it forms a hollow tube before crashing down.", answer: "plunging", explain: "A curling lip and a tube are the signs of a plunging wave." },
    { id: "rock-platform", prompt: "At a rock platform, the water doesn't break but rushes up the rocks and then pours back off them.", answer: "surging", explain: "With deep water right to the edge, waves surge up and drain back without properly breaking." },
    { id: "spinal", prompt: "Which type of wave is most likely to drive a bodysurfer into the sand and cause a spinal injury?", answer: "plunging", explain: "Plunging waves, and dumpers close to shore, break with great force in shallow water." },
    { id: "learners", prompt: "Which type of wave is usually best for beginners learning to bodysurf?", answer: "spilling", explain: "Spilling waves are gentle and break gradually." },
    { id: "backwash", prompt: "Which type of wave is known for strong backwash that can drag people into deep water?", answer: "surging", explain: "Surging waves rush back down steep beaches and rocks." },
    { id: "shore-dump", prompt: "At low tide on a steep beach, waves are slamming down hard right at the water's edge.", answer: "plunging", explain: "That's shore break, or dumpers: plunging waves breaking in very shallow water." },
  ],
  notes: [
    {
      title: "On patrol",
      points: [
        "Watch for a few minutes before going in, to see how big the sets are and how long the lulls last",
        "Conditions change with the tide: a beach that spills at high tide can dump at low tide",
        "On a dumping beach, warn swimmers and be ready for neck and back injuries",
      ],
    },
  ],
  source: SOURCE,
};

export const SIGNS_OF_A_RIP: LearnSet = {
  slug: "signs-of-a-rip",
  topic: "surf-awareness",
  title: "Signs of a rip",
  purpose: "Spotting rip currents, so you can place the flags away from them and warn swimmers.",
  whenToUse: ["Choosing where to put the flags", "Scanning the water during patrol", "Deciding where to put warning signs and rescue gear"],
  intro: "A rip may show only one or two of these signs, so look for any of them.",
  items: [
    { id: "dark", term: "Deeper, darker water", meaning: "The channel is deeper than the sandbanks either side, so it looks darker." },
    { id: "fewer-waves", term: "Fewer breaking waves", meaning: "Waves break less over the deeper channel, so it can look like the calmest spot." },
    { id: "rippled", term: "Rippled surface", meaning: "A rippled patch surrounded by smoother water." },
    { id: "debris", term: "Debris floating out to sea", meaning: "Seaweed, foam or rubbish carried out through the surf." },
    { id: "foamy", term: "Foamy or sandy water", meaning: "Discoloured, foamy or sandy water out beyond the surf." },
  ],
  questions: ["odd-one-out", "scenario", "fact"],
  facts: ["rip-dark", "rip-not-sign"],
  decoys: [
    "More waves breaking than either side",
    "Clear, shallow water over sand",
    "Waves breaking evenly along the beach",
    "Seaweed washing up onto the sand",
  ],
  scenarios: [
    { id: "calm-gap", prompt: "A family wants to swim in a gap between the waves because it looks calm. What sign of a rip might that be?", answer: "fewer-waves", explain: "Rips often have fewer breaking waves, so they look like the calmest water. That's what catches people out." },
    { id: "seaweed-out", prompt: "You see a line of seaweed moving out past the breakers.", answer: "debris", explain: "Debris floating out to sea shows water flowing seaward: a rip." },
    { id: "brown-plume", prompt: "From the tower, there's a brownish plume of water out beyond the surf.", answer: "foamy", explain: "Sandy, discoloured water beyond the surf is a sign of a rip carrying sand out." },
  ],
  notes: [
    {
      title: "On patrol",
      points: [
        "Put the flags beside a sandbank, away from rips",
        "Warning signs and rescue gear go next to rips, where people are likely to need help",
        "Rips move and change with the tide and swell, so keep checking",
      ],
    },
  ],
  source: SOURCE,
};

export const WAVE_WORDS: LearnSet = {
  slug: "wave-words",
  topic: "surf-awareness",
  title: "Wave words",
  purpose: "The words used to describe waves and surf conditions.",
  visual: "wave-anatomy",
  items: [
    { id: "crest", term: "Crest", meaning: "The highest point of a wave." },
    { id: "trough", term: "Trough", meaning: "The lowest point between two waves." },
    { id: "height", term: "Wave height", meaning: "The vertical distance from the trough to the crest." },
    { id: "wavelength", term: "Wavelength", meaning: "The distance from one crest to the next." },
    { id: "period", term: "Wave period", meaning: "The time between two crests passing the same point." },
    { id: "set", term: "Set", meaning: "A group of bigger waves arriving one after another." },
    { id: "lull", term: "Lull", meaning: "A calmer spell between sets." },
    { id: "swell", term: "Swell", meaning: "Waves made by wind far away: regular, evenly spaced and long-period." },
    { id: "wind-waves", term: "Wind waves", meaning: "Waves made by local wind: short, choppy and irregular." },
    { id: "backwash", term: "Backwash", meaning: "Water running back down the beach after a wave has washed up it." },
    { id: "shore-break", term: "Shore break", meaning: "Waves breaking right at the water's edge, often hard and dumping." },
  ],
  questions: ["meaning", "term"],
  prompts: { meaning: "What does “{term}” mean?", term: "Which word means: “{meaning}”" },
  source: SOURCE,
};

export const SURF_AWARENESS_SETS: LearnSet[] = [TYPES_OF_WAVES, SIGNS_OF_A_RIP, WAVE_WORDS];
