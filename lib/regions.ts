import type { Booster, BoosterId, Region, SudokuPuzzle } from "@/types/game";

const solution = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9]
];

function puzzle(id: string, rows: string[]): SudokuPuzzle {
  return {
    id,
    givens: rows.map((row) => row.split("").map(Number)),
    solution
  };
}

export const boosters: Record<BoosterId, Booster> = {
  "fog-breaker": {
    id: "fog-breaker",
    name: "Fog Breaker",
    description: "Clears 3 fogged cells in Sakura Forest."
  },
  "logic-hint": {
    id: "logic-hint",
    name: "Logic Hint",
    description: "Reveals a small tactical hint in Architect Mode."
  },
  "memory-seal": {
    id: "memory-seal",
    name: "Memory Seal",
    description: "Pauses Desert clue fading for 60 seconds."
  },
  "focus-token": {
    id: "focus-token",
    name: "Focus Token",
    description: "Allows 3 temporary notes in No Notes battles."
  },
  "star-reveal": {
    id: "star-reveal",
    name: "Star Reveal",
    description: "Highlights one linked pair in Steppe Observatory."
  },
  "mistake-shield": {
    id: "mistake-shield",
    name: "Mistake Shield",
    description: "A future shield against one battle mistake."
  },
  "time-seal": {
    id: "time-seal",
    name: "Time Seal",
    description: "A future timer control booster."
  }
};

export const regions: Region[] = [
  {
    id: "sakura-forest",
    name: "Sakura Forest",
    order: 0,
    description:
      "A veiled woodland academy where recruits learn to see the grid through drifting mist.",
    master: {
      id: "lady-ren",
      name: "Lady Ren",
      title: "Keeper of the Hidden Grid",
      dialogue:
        "Numbers are like petals. Look too slowly, and they disappear into the mist.",
      defeatDialogue:
        "The forest rewards calm eyes. Return when the pattern has stopped running from you."
    },
    difficulty: "Initiate",
    modifier: "fog-sudoku",
    modifierName: "Fog Sudoku",
    battleRule:
      "Some empty cells are covered by fog. Fog clears when you complete rows, columns, or 3x3 boxes.",
    recommendedBooster: "fog-breaker",
    reward: { coins: 75, xp: 60, boosterId: "logic-hint", boosterCount: 1 },
    puzzle: puzzle("sakura-puzzle", [
      "530070000",
      "600195000",
      "098000060",
      "800060003",
      "400803001",
      "700020006",
      "060000280",
      "000419005",
      "000080079"
    ]),
    victoryText:
      "Lady Ren bows as the fog lifts from the academy gates. Sakura Forest now answers to your banner."
  },
  {
    id: "iron-citadel",
    name: "Iron Citadel",
    order: 1,
    description:
      "A fortress of riveted logic, built around severe grids and future killer-cage trials.",
    master: {
      id: "marshal-vorn",
      name: "Marshal Vorn",
      title: "Architect of the Nine Walls",
      dialogue:
        "A citadel falls only when every wall agrees with every tower.",
      defeatDialogue:
        "Stone remembers every careless number. Study the walls and return."
    },
    difficulty: "Adept",
    modifier: "architect-mode",
    modifierName: "Architect Mode",
    battleRule:
      "Standard Sudoku for MVP. Later this region can evolve into Killer Sudoku with cage sums.",
    recommendedBooster: "logic-hint",
    reward: { coins: 90, xp: 75, boosterId: "memory-seal", boosterCount: 1 },
    puzzle: puzzle("iron-puzzle", [
      "500078900",
      "070100348",
      "198300007",
      "850060020",
      "006803700",
      "010020056",
      "900537284",
      "287009030",
      "005280179"
    ]),
    victoryText:
      "The gates of the Iron Citadel open with a measured groan. Its masters add your academy seal to the inner wall."
  },
  {
    id: "desert-archive",
    name: "Desert Archive",
    order: 2,
    description:
      "A sun-bleached library where old clues fade unless they are held in memory.",
    master: {
      id: "scribe-amara",
      name: "Scribe Amara",
      title: "Archivist of Vanishing Proofs",
      dialogue:
        "Ink is honest only for a moment. The rest belongs to memory.",
      defeatDialogue:
        "You chased the sand instead of the structure. The archive will wait."
    },
    difficulty: "Veteran",
    modifier: "vanishing-clues",
    modifierName: "Vanishing Clues",
    battleRule:
      "Every 90 seconds, one given clue becomes visually faded. The value remains valid, but harder to read.",
    recommendedBooster: "memory-seal",
    reward: { coins: 110, xp: 90, boosterId: "focus-token", boosterCount: 1 },
    puzzle: puzzle("desert-puzzle", [
      "034678002",
      "602005300",
      "100340560",
      "009701403",
      "420050091",
      "703904800",
      "061030004",
      "007400605",
      "300286170"
    ]),
    victoryText:
      "The last faded clue burns gold in the archive index. Your academy inherits the desert's oldest theorem."
  },
  {
    id: "neon-monastery",
    name: "Neon Monastery",
    order: 3,
    description:
      "A quiet order of bright glass and stricter discipline, where notes are forbidden.",
    master: {
      id: "abbot-cyra",
      name: "Abbot Cyra",
      title: "Silent Current of the Grid",
      dialogue:
        "Do not write every thought. Let only the necessary number survive.",
      defeatDialogue:
        "Noise entered the grid before truth did. Silence yourself and try again."
    },
    difficulty: "Master",
    modifier: "no-notes",
    modifierName: "No Notes Battle",
    battleRule:
      "Notes mode is disabled. A Focus Token allows exactly 3 temporary note placements.",
    recommendedBooster: "focus-token",
    reward: { coins: 130, xp: 110, boosterId: "star-reveal", boosterCount: 1 },
    puzzle: puzzle("neon-puzzle", [
      "000670912",
      "672000048",
      "000342000",
      "850701020",
      "006000700",
      "010904056",
      "000537000",
      "280000635",
      "345086000"
    ]),
    victoryText:
      "The monastery lights settle into a single clean line. Abbot Cyra gives your academy the vow of focus."
  },
  {
    id: "steppe-observatory",
    name: "Steppe Observatory",
    order: 4,
    description:
      "A wind-scoured observatory where distant cells answer one another like constellations.",
    master: {
      id: "orlan-the-astronomer",
      name: "Orlan the Astronomer",
      title: "Cartographer of Paired Stars",
      dialogue:
        "No star is alone. Solve one point, and another begins to shine.",
      defeatDialogue:
        "The sky did not move. Your map did. Return with a steadier hand."
    },
    difficulty: "Mythic",
    modifier: "star-link",
    modifierName: "Star Link",
    battleRule:
      "Several linked cell pairs are marked. Solving one cell reveals a clue highlight on its paired cell.",
    recommendedBooster: "star-reveal",
    reward: { coins: 160, xp: 140, boosterId: "fog-breaker", boosterCount: 1 },
    puzzle: puzzle("steppe-puzzle", [
      "030600010",
      "600195040",
      "090000560",
      "800701003",
      "020050090",
      "700904006",
      "061000080",
      "020419005",
      "340006070"
    ]),
    victoryText:
      "The observatory rotates toward dawn. The final master names your academy a sovereign mind."
  }
];

export function getRegion(regionId: string) {
  return regions.find((region) => region.id === regionId);
}

export function getNextRegion(regionId: string) {
  const region = getRegion(regionId);
  if (!region) return undefined;
  return regions.find((candidate) => candidate.order === region.order + 1);
}
