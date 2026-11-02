// Badges for the profile: small, fun milestones worked out from what's already
// saved (streaks, test results, signal mastery, topic levels). Nothing extra is
// stored; a badge appears as soon as its condition is true.

import { SET_TOPICS, type SetTopicId } from "@/content/sets";
import { longestStreak, practiceStreak } from "@/lib/progress";
import { dailyKey } from "@/lib/daily";
import type { TopicArea } from "@/lib/topicProgress";

export interface SavedResult {
  drill: string;
  item: string | null;
  score: number;
  total: number;
  mistakes: number;
  at: string;
}

export interface BadgeInput {
  areas: TopicArea[];
  results: SavedResult[]; // every saved result, newest first
  practiceTimes: string[];
  signalsMastered: number;
  signalsTotal: number;
  performSessions: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string; // an emoji, or "topic:<id>" for a topic's icon
  earned: boolean;
  progress?: { done: number; total: number };
}

const perfect = (r: SavedResult) => (r.drill === "mnemonic_match" || r.drill === "radio_build_call" ? r.mistakes === 0 : r.score === r.total);

export function badges(input: BadgeInput, now = new Date()): Badge[] {
  const { areas, results, practiceTimes } = input;
  const best = Math.max(longestStreak(practiceTimes), practiceStreak(practiceTimes, now).days);
  const dailies = results.filter((r) => r.drill === "daily_mix");
  const dailyDays = new Set(dailies.map((r) => dailyKey(new Date(r.at)))).size;
  const perfects = results.filter(perfect).length;
  const topicsWithAPass = areas.filter((a) => a.done > 0).length;
  const anything = results.length > 0 || input.performSessions > 0 || input.signalsMastered > 0 || practiceTimes.length > 0;

  const streak = (id: string, title: string, days: number, icon: string): Badge => ({
    id,
    title,
    description: `Practise ${days} days in a row.`,
    icon,
    earned: best >= days,
    progress: { done: Math.min(best, days), total: days },
  });

  const topicBadges = SET_TOPICS.map((t): Badge => {
    const a = areas.find((x) => x.id === t.id)!;
    return {
      id: `topic-${t.id}`,
      title: t.title,
      description: `Pass every set in ${t.title}.`,
      icon: `topic:${t.id}`,
      earned: a.level === "patrol-ready",
      progress: { done: a.done, total: a.total },
    };
  });

  return [
    { id: "first", title: "First splash", description: "Finish your first test or signal session.", icon: "🌊", earned: anything },
    streak("streak-3", "On a roll", 3, "🔥"),
    streak("streak-7", "Full week", 7, "📅"),
    streak("streak-30", "Season regular", 30, "🏆"),
    {
      id: "daily-5",
      title: "Daily habit",
      description: "Do today's practice on 5 different days.",
      icon: "☀️",
      earned: dailyDays >= 5,
      progress: { done: Math.min(dailyDays, 5), total: 5 },
    },
    {
      id: "daily-perfect",
      title: "Clean sweep",
      description: "Get every question right in today's practice.",
      icon: "🧹",
      earned: dailies.some((r) => r.score === r.total),
    },
    {
      id: "perfect-10",
      title: "Sharpshooter",
      description: "Get 10 tests perfect.",
      icon: "🎯",
      earned: perfects >= 10,
      progress: { done: Math.min(perfects, 10), total: 10 },
    },
    {
      id: "signals",
      title: "Signal master",
      description: "Master all the hand signals.",
      icon: "🙌",
      earned: input.signalsTotal > 0 && input.signalsMastered >= input.signalsTotal,
      progress: { done: input.signalsMastered, total: input.signalsTotal || 14 },
    },
    {
      id: "camera",
      title: "Lights, camera",
      description: "Finish a Perform session in front of your camera.",
      icon: "🎥",
      earned: input.performSessions > 0,
    },
    {
      id: "all-rounder",
      title: "All-rounder",
      description: "Pass at least one set in every topic.",
      icon: "🧭",
      earned: topicsWithAPass === areas.length,
      progress: { done: topicsWithAPass, total: areas.length },
    },
    ...topicBadges,
    {
      id: "patrol-ready",
      title: "Patrol Ready",
      description: "Pass every set in every topic.",
      icon: "🏅",
      earned: areas.every((a) => a.level === "patrol-ready"),
      progress: { done: areas.filter((a) => a.level === "patrol-ready").length, total: areas.length },
    },
  ];
}

export function isTopicIcon(icon: string): SetTopicId | null {
  return icon.startsWith("topic:") ? (icon.slice(6) as SetTopicId) : null;
}
