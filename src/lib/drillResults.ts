// Results of finished tests and sessions (set quizzes and extras, signals, today's practice): what can be saved, and what counts as
// mastered or passed. Shared by the save endpoint, the stats API and the dashboard.

import { findSet, getSetTopic, type LearnSet, type LegacyResult, type SetTopicId } from "@/content/sets";

export const SAVED_DRILLS = [
  "mnemonic_quiz",
  "mnemonic_match",
  "mnemonic_mixed",
  "radio_prowords",
  "radio_phonetic",
  "radio_spell",
  "radio_build_call",
  "set_quiz",
  "topic_mixed",
  "daily_mix",
  "signals_identify",
  "signals_perform",
] as const;
export type SavedDrill = (typeof SAVED_DRILLS)[number];

export interface DrillResultInput {
  drill: SavedDrill;
  item: string | null;
  score: number;
  total: number;
  mistakes: number;
}

// Checks a result sent from the browser; returns null if anything is off
export function parseDrillResult(body: unknown): DrillResultInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (!SAVED_DRILLS.includes(b.drill as SavedDrill)) return null;
  const int = (v: unknown, max: number) => (Number.isInteger(v) && (v as number) >= 0 && (v as number) <= max ? (v as number) : null);
  const total = int(b.total, 100);
  const score = int(b.score, 100);
  const mistakes = int(b.mistakes ?? 0, 500);
  if (total === null || total === 0 || score === null || score > total || mistakes === null) return null;
  const item = b.item == null ? null : typeof b.item === "string" && /^[a-z0-9-]{1,40}$/.test(b.item) ? b.item : undefined;
  if (item === undefined) return null;
  return { drill: b.drill as SavedDrill, item, score, total, mistakes };
}

export interface LatestResult {
  drill: string;
  item: string | null;
  score: number;
  total: number;
  mistakes: number;
  at: string;
}

// The newest result for each test (and mnemonic/scenario), from results sorted newest first
export function latestResults<T extends { drill: string; item: string | null }>(newestFirst: T[]): T[] {
  const seen = new Set<string>();
  return newestFirst.filter((r) => {
    const key = `${r.drill}|${r.item ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// --- Sets: passed = 90% or more on the set's quiz, or an older result that
// still counts (see LegacyResult), so progress from before sets carries over ---

export const PASS_MARK = 0.9;
/** @deprecated use PASS_MARK */
export const RADIO_PASS_MARK = PASS_MARK;

export interface SetProgress {
  slug: string;
  title: string;
  tried: boolean;
  passed: boolean;
}

const legacyPassed = (rule: LegacyResult, r: LatestResult) =>
  rule.pass === "perfect" ? r.score === r.total : rule.pass === "no-mistakes" ? r.mistakes === 0 : r.score / r.total >= PASS_MARK;

// Results that count towards a set: its quiz, its extras and any older equivalents
function resultsFor(set: LearnSet, latest: LatestResult[]) {
  const quiz = latest.filter((r) => r.drill === "set_quiz" && r.item === set.slug);
  const legacy = (set.legacy ?? []).flatMap((rule) =>
    latest.filter((r) => r.drill === rule.drill && (rule.item === undefined || r.item === rule.item)).map((r) => ({ r, rule }))
  );
  return { quiz, legacy };
}

export function progressForSet(set: LearnSet, latest: LatestResult[]): SetProgress {
  const { quiz, legacy } = resultsFor(set, latest);
  const passed = quiz.some((r) => r.score / r.total >= PASS_MARK) || legacy.some(({ r, rule }) => legacyPassed(rule, r));
  return { slug: set.slug, title: set.title, tried: quiz.length > 0 || legacy.length > 0, passed };
}

export function setProgress(latest: LatestResult[], topic: SetTopicId): SetProgress[] {
  return (getSetTopic(topic)?.sets ?? []).map((set) => progressForSet(set, latest));
}

// --- Names for the History page ---

const RADIO_TITLES: Record<string, string> = {
  radio_prowords: "Prowords",
  radio_phonetic: "Phonetic alphabet",
  radio_spell: "Phonetic alphabet: Spell it",
  radio_build_call: "Radio calls: Build the call",
};

export type ResultArea = "daily" | SetTopicId;

// What a saved result was, in words: "SAMPLE: Match", "Prowords"…
export function describeResult(drill: string, item: string | null): { area: ResultArea; title: string } {
  if (drill === "daily_mix") return { area: "daily", title: "Daily practice" };
  if (drill === "signals_identify") return { area: "communication", title: "Hand signals: Identify" };
  if (drill === "signals_perform") return { area: "communication", title: "Hand signals: Perform" };
  if (drill === "mnemonic_mixed") return { area: "first-aid", title: "Acronyms: Mixed quiz" };
  if (drill === "mnemonic_quiz" || drill === "mnemonic_match") {
    const set = findSet(item ?? "");
    return { area: set?.topic ?? "first-aid", title: `${set?.title ?? "Acronym"}: ${drill === "mnemonic_quiz" ? "Quiz" : "Match"}` };
  }
  if (drill === "set_quiz") {
    const set = findSet(item ?? "");
    if (set) return { area: set.topic, title: set.title };
  }
  if (drill === "topic_mixed") {
    const topic = getSetTopic(item ?? "");
    if (topic) return { area: topic.id, title: "Mixed quiz" };
  }
  return { area: "communication", title: RADIO_TITLES[drill] ?? "Test" };
}
