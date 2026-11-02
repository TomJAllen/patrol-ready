// Patrol & safety: running a patrol and looking after yourself and each other.

import { fromMnemonic } from "./fromMnemonic";
import type { LearnSet } from "./types";

export const BEACH_FLAGS: LearnSet = {
  slug: "beach-flags",
  topic: "patrol",
  title: "Beach flags",
  purpose: "What each beach flag means, and where they go.",
  whenToUse: ["Setting up and moving the patrol area", "Closing the water in an emergency"],
  items: [
    { id: "red-yellow", term: "Red and yellow flags", meaning: "The patrolled area: swim between the flags. Set them beside a sandbank, away from rips." },
    { id: "black-white", term: "Black and white quartered flags", meaning: "An area where surfing and other craft aren't allowed, often a buffer either side of the swimming flags." },
    { id: "red-white", term: "Red and white quartered flag", meaning: "Emergency evacuation: raised with the alarm when the water is being closed." },
    { id: "red", term: "Red flag", meaning: "The beach is closed: no swimming." },
  ],
  questions: ["meaning", "term", "fact"],
  prompts: { meaning: "What does this mean: {term}?", term: "Which flag is this: “{meaning}”" },
  facts: ["flags-placement", "flags-craft", "flags-evac"],
  source: "SLSA Public Safety and Aquatic Rescue Training Manual, 35th ed., Module 10 – Patrol Operations. Summarised in our own words.",
};

export const PATROL_SETS: LearnSet[] = [
  BEACH_FLAGS,
  fromMnemonic("im-safe", "patrol"),
  fromMnemonic("calm", "patrol"),
  fromMnemonic("think-smart", "patrol"),
  fromMnemonic("help", "patrol", { facts: ["float"] }),
];
