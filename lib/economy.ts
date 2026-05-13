import type { BoosterId, PlayerProgress, Reward } from "@/types/game";
import { getNextRegion, getRegion, regions } from "@/lib/regions";

export const BATTLE_ENERGY_COST = 1;
export const MAX_MISTAKES = 3;
export const ENERGY_REFILL_AMOUNT = 5;

export function getRank(level: number) {
  if (level >= 8) return "Grand Strategist";
  if (level >= 5) return "Mind Captain";
  if (level >= 3) return "Grid Adept";
  return "Recruit";
}

export function getRegionStatus(progress: PlayerProgress, regionId: string) {
  if (progress.conqueredRegionIds.includes(regionId)) return "conquered";
  if (progress.unlockedRegionIds.includes(regionId)) return "available";
  const region = getRegion(regionId);
  if (region?.order === 0) return "available";
  const previousRegion = regions.find((candidate) => candidate.order === (region?.order ?? 0) - 1);
  if (previousRegion && progress.conqueredRegionIds.includes(previousRegion.id)) {
    return "available";
  }
  return "locked";
}

export function spendBattleEnergy(progress: PlayerProgress): PlayerProgress {
  return {
    ...progress,
    energy: Math.max(0, progress.energy - BATTLE_ENERGY_COST)
  };
}

export function useInventoryBooster(progress: PlayerProgress, boosterId: BoosterId): PlayerProgress {
  return {
    ...progress,
    inventory: {
      ...progress.inventory,
      [boosterId]: Math.max(0, progress.inventory[boosterId] - 1)
    }
  };
}

export function grantReward(progress: PlayerProgress, reward: Reward): PlayerProgress {
  const nextXp = progress.academy.xp + reward.xp;
  const nextLevel = Math.max(1, Math.floor(nextXp / 100) + 1);
  return {
    ...progress,
    coins: progress.coins + reward.coins,
    rank: getRank(nextLevel),
    academy: {
      ...progress.academy,
      xp: nextXp,
      level: nextLevel
    },
    inventory: reward.boosterId
      ? {
          ...progress.inventory,
          [reward.boosterId]:
            progress.inventory[reward.boosterId] + (reward.boosterCount ?? 1)
        }
      : progress.inventory
  };
}

export function completeRegion(progress: PlayerProgress, regionId: string) {
  const region = getRegion(regionId);
  if (!region) {
    return {
      progress,
      coinsEarned: 0,
      xpEarned: 0,
      unlockedRegionId: "",
      unlockedRegionName: ""
    };
  }

  const firstConquest = !progress.conqueredRegionIds.includes(regionId);
  const reward = firstConquest ? region.reward : { coins: 25, xp: 15 };
  let updated = grantReward(progress, reward);
  const nextRegion = getNextRegion(regionId);

  if (firstConquest) {
    updated = {
      ...updated,
      conqueredRegionIds: [...updated.conqueredRegionIds, regionId],
      unlockedRegionIds:
        nextRegion && !updated.unlockedRegionIds.includes(nextRegion.id)
          ? [...updated.unlockedRegionIds, nextRegion.id]
          : updated.unlockedRegionIds
    };
  }

  return {
    progress: updated,
    coinsEarned: reward.coins,
    xpEarned: reward.xp,
    unlockedRegionId: firstConquest ? nextRegion?.id ?? "" : "",
    unlockedRegionName: firstConquest ? nextRegion?.name ?? "" : ""
  };
}

export function buyMockShopItem(
  progress: PlayerProgress,
  cost: number,
  change: (current: PlayerProgress) => PlayerProgress
) {
  if (progress.coins < cost) return progress;
  return change({ ...progress, coins: progress.coins - cost });
}
