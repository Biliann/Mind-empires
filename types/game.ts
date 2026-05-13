export type RegionStatus = "locked" | "available" | "conquered";

export type BattleModifier =
  | "fog-sudoku"
  | "architect-mode"
  | "vanishing-clues"
  | "no-notes"
  | "star-link";

export type BoosterId =
  | "fog-breaker"
  | "logic-hint"
  | "memory-seal"
  | "focus-token"
  | "star-reveal"
  | "mistake-shield"
  | "time-seal";

export interface Reward {
  coins: number;
  xp: number;
  boosterId?: BoosterId;
  boosterCount?: number;
}

export interface PuzzleMaster {
  id: string;
  name: string;
  title: string;
  dialogue: string;
  defeatDialogue: string;
}

export interface SudokuPuzzle {
  id: string;
  givens: number[][];
  solution: number[][];
}

export interface Region {
  id: string;
  name: string;
  order: number;
  description: string;
  master: PuzzleMaster;
  difficulty: "Initiate" | "Adept" | "Veteran" | "Master" | "Mythic";
  modifier: BattleModifier;
  modifierName: string;
  battleRule: string;
  recommendedBooster: BoosterId;
  reward: Reward;
  puzzle: SudokuPuzzle;
  victoryText: string;
}

export interface Booster {
  id: BoosterId;
  name: string;
  description: string;
}

export interface InventoryItem {
  id: BoosterId;
  count: number;
}

export interface Academy {
  name: string;
  level: number;
  xp: number;
  theme: string;
  upgrades: Record<string, number>;
}

export interface PlayerProgress {
  rank: string;
  energy: number;
  coins: number;
  premiumCurrency: number;
  conqueredRegionIds: string[];
  unlockedRegionIds: string[];
  academy: Academy;
  inventory: Record<BoosterId, number>;
}

export interface BattleSession {
  regionId: string;
  startedAt: number;
  timerSeconds: number;
  mistakes: number;
  boostersUsed: BoosterId[];
  notesMode: boolean;
  board: number[][];
  notes: string[][][];
}
