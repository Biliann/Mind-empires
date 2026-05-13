"use client";

import { useEffect, useState } from "react";
import type { PlayerProgress } from "@/types/game";

const STORAGE_KEY = "mind-empires-progress-v1";

export const defaultProgress: PlayerProgress = {
  rank: "Recruit",
  energy: 5,
  coins: 100,
  premiumCurrency: 0,
  conqueredRegionIds: [],
  unlockedRegionIds: ["sakura-forest"],
  academy: {
    name: "Dawn Mind Academy",
    level: 1,
    xp: 0,
    theme: "Obsidian Courtyard",
    upgrades: {
      "study-hall": 0,
      "strategy-room": 0,
      archive: 0
    }
  },
  inventory: {
    "fog-breaker": 1,
    "logic-hint": 1,
    "memory-seal": 1,
    "focus-token": 1,
    "star-reveal": 1,
    "mistake-shield": 1,
    "time-seal": 0
  }
};

function mergeProgress(value: Partial<PlayerProgress>): PlayerProgress {
  return {
    ...defaultProgress,
    ...value,
    academy: {
      ...defaultProgress.academy,
      ...value.academy,
      upgrades: {
        ...defaultProgress.academy.upgrades,
        ...value.academy?.upgrades
      }
    },
    inventory: {
      ...defaultProgress.inventory,
      ...value.inventory
    }
  };
}

export function loadProgress(): PlayerProgress {
  if (typeof window === "undefined") return defaultProgress;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress;
    return mergeProgress(JSON.parse(raw) as Partial<PlayerProgress>);
  } catch {
    return defaultProgress;
  }
}

export function saveProgress(progress: PlayerProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function resetProgress() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function useProgress() {
  const [progress, setProgressState] = useState<PlayerProgress>(defaultProgress);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProgressState(loadProgress());
    setReady(true);
  }, []);

  const setProgress = (next: PlayerProgress | ((current: PlayerProgress) => PlayerProgress)) => {
    setProgressState((current) => {
      const resolved = typeof next === "function" ? next(current) : next;
      saveProgress(resolved);
      return resolved;
    });
  };

  return { progress, setProgress, ready };
}
