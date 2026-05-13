"use client";

import { AppFrame } from "@/components/ui/AppFrame";
import { Button } from "@/components/ui/Button";
import { Eyebrow, Panel, Stat } from "@/components/ui/Panel";
import { regions } from "@/lib/regions";
import { useProgress } from "@/lib/storage";

const upgradeCards = [
  {
    id: "study-hall",
    name: "Study Hall",
    text: "Mock upgrade for recruit training capacity.",
    cost: 50
  },
  {
    id: "strategy-room",
    name: "Strategy Room",
    text: "Mock upgrade for battle planning and future modifiers.",
    cost: 75
  },
  {
    id: "archive",
    name: "Archive",
    text: "Mock upgrade for puzzle records and lore collections.",
    cost: 100
  }
];

export function AcademyClient() {
  const { progress, setProgress } = useProgress();
  const xpIntoLevel = progress.academy.xp % 100;
  const conquered = regions.filter((region) =>
    progress.conqueredRegionIds.includes(region.id)
  );

  function upgrade(id: string, cost: number) {
    if (progress.coins < cost) return;
    setProgress({
      ...progress,
      coins: progress.coins - cost,
      academy: {
        ...progress.academy,
        upgrades: {
          ...progress.academy.upgrades,
          [id]: (progress.academy.upgrades[id] ?? 0) + 1
        }
      }
    });
  }

  return (
    <AppFrame>
      <header>
        <Eyebrow>Academy</Eyebrow>
        <h1 className="mt-2 font-serif text-4xl text-bone">{progress.academy.name}</h1>
      </header>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Panel>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Level" value={progress.academy.level} />
            <Stat label="Rank" value={progress.rank} />
            <Stat label="Coins" value={progress.coins} />
            <Stat label="Conquered" value={conquered.length} />
          </div>
          <div className="mt-5">
            <div className="flex justify-between text-sm text-mist">
              <span>XP progress</span>
              <span>{xpIntoLevel}/100</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-obsidian">
              <div
                className="h-full rounded-full bg-gold"
                style={{ width: `${xpIntoLevel}%` }}
              />
            </div>
          </div>
          <div className="mt-5 rounded-md border border-gold/10 bg-obsidian/50 p-4">
            <p className="text-sm uppercase tracking-[0.14em] text-ember">
              Cosmetic theme
            </p>
            <p className="mt-1 text-lg text-bone">{progress.academy.theme}</p>
            <p className="mt-2 text-sm text-mist">
              Placeholder only for MVP. Themes can become cosmetic purchases later.
            </p>
          </div>
        </Panel>

        <Panel>
          <h2 className="text-2xl font-semibold text-bone">Unlocked Techniques</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {regions.map((region) => {
              const unlocked = progress.unlockedRegionIds.includes(region.id);
              return (
                <div
                  key={region.id}
                  className={`rounded-md border border-gold/10 bg-obsidian/50 p-3 ${
                    unlocked ? "" : "opacity-45"
                  }`}
                >
                  <p className="font-semibold text-bone">{region.modifierName}</p>
                  <p className="mt-1 text-xs text-mist">{region.name}</p>
                </div>
              );
            })}
          </div>
        </Panel>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {upgradeCards.map((upgradeCard) => (
          <Panel key={upgradeCard.id}>
            <h3 className="text-xl font-semibold text-bone">{upgradeCard.name}</h3>
            <p className="mt-2 min-h-12 text-sm text-mist">{upgradeCard.text}</p>
            <p className="mt-4 text-sm text-gold">
              Level {progress.academy.upgrades[upgradeCard.id] ?? 0}
            </p>
            <Button
              className="mt-4 w-full"
              tone="secondary"
              disabled={progress.coins < upgradeCard.cost}
              onClick={() => upgrade(upgradeCard.id, upgradeCard.cost)}
            >
              Upgrade for {upgradeCard.cost} coins
            </Button>
          </Panel>
        ))}
      </section>
    </AppFrame>
  );
}
