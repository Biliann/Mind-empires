"use client";

import { AppFrame } from "@/components/ui/AppFrame";
import { LinkButton } from "@/components/ui/Button";
import { SakuraIcon, ScrollIcon, SudokuIcon, ToriiIcon } from "@/components/ui/GameIcons";
import { Eyebrow, Panel, Stat } from "@/components/ui/Panel";
import { regions } from "@/lib/regions";
import { useProgress } from "@/lib/storage";
import { visualAssets } from "@/lib/visual-assets";

export function HomeClient() {
  const { progress, ready } = useProgress();
  const nextRegion =
    regions.find((region) => progress.unlockedRegionIds.includes(region.id) && !progress.conqueredRegionIds.includes(region.id)) ??
    regions[0];

  if (!ready) {
    return (
      <AppFrame>
        <Panel>
          <Eyebrow>Loading</Eyebrow>
          <h1 className="mt-2 text-2xl font-semibold text-bone">Preparing academy state...</h1>
        </Panel>
      </AppFrame>
    );
  }

  return (
    <AppFrame>
      <section className="grid gap-5 lg:grid-cols-[1.12fr_0.88fr] lg:items-stretch">
        <div className="ink-wash min-h-[560px] overflow-hidden rounded-lg border border-black/10 p-6 shadow-premium">
          <div className="grid h-full gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="flex h-full flex-col justify-between gap-8">
              <div>
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-sakura text-ember">
                    <SakuraIcon className="h-6 w-6" />
                  </span>
                  <Eyebrow>Zen Sudoku campaign</Eyebrow>
                </div>
                <h1 className="mt-5 max-w-2xl text-5xl font-semibold leading-tight text-bone sm:text-7xl">
                  Mind Empires
                </h1>
                <p className="mt-4 max-w-xl text-lg leading-7 text-mist">
                  Conquer the world through calm, precise Sudoku battles.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-black/10 bg-white/80 p-4">
                  <SudokuIcon className="h-8 w-8 text-gold" />
                  <p className="mt-3 text-sm font-semibold text-bone">Sudoku first</p>
                  <p className="mt-1 text-xs text-mist">Keyboard and touch play.</p>
                </div>
                <div className="rounded-lg border border-black/10 bg-white/80 p-4">
                  <SakuraIcon className="h-8 w-8 text-ember" />
                  <p className="mt-3 text-sm font-semibold text-bone">Sakura path</p>
                  <p className="mt-1 text-xs text-mist">Sequential regions.</p>
                </div>
                <div className="rounded-lg border border-black/10 bg-white/80 p-4">
                  <ToriiIcon className="h-8 w-8 text-moss" />
                  <p className="mt-3 text-sm font-semibold text-bone">Masters</p>
                  <p className="mt-1 text-xs text-mist">Narrative battles.</p>
                </div>
              </div>
            </div>

            <div className="relative min-h-[420px] overflow-hidden rounded-lg border border-black/10 bg-white">
              <img
                src={visualAssets.sakuraStreet}
                alt="Cherry blossoms over a quiet Japanese street"
                className="image-soft absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/25 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <div className="rounded-lg border border-black/10 bg-white/88 p-4 shadow-insetGlow backdrop-blur">
                  <p className="text-sm text-mist">Next campaign target</p>
                  <p className="mt-1 text-2xl font-semibold text-bone">{nextRegion.name}</p>
                  <p className="mt-2 text-sm text-mist">
                    {nextRegion.master.name}, {nextRegion.master.title}
                  </p>
                </div>
                <div className="hidden h-24 w-24 place-items-center rounded-full border border-black/10 bg-sakura/90 text-ember shadow-insetGlow backdrop-blur sm:grid">
                  <ScrollIcon className="h-12 w-12" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Panel className="flex flex-col justify-between gap-5">
          <div>
            <Eyebrow>Player Academy</Eyebrow>
            <h2 className="mt-2 text-2xl font-semibold text-bone">
              {progress.academy.name}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Stat label="Rank" value={progress.rank} />
              <Stat label="Energy" value={progress.energy} />
              <Stat label="Coins" value={progress.coins} />
              <Stat label="Regions" value={progress.conqueredRegionIds.length} />
            </div>
            <div className="mt-4 overflow-hidden rounded-lg border border-black/10">
              <img
                src={visualAssets.himejiSakura}
                alt="Cherry blossoms at Himeji Castle"
                className="image-soft h-44 w-full object-cover"
              />
            </div>
          </div>

          <div className="grid gap-3">
            <LinkButton href={`/battle/${nextRegion.id}`}>Continue Campaign</LinkButton>
            <LinkButton href="/map" tone="secondary">
              World Map
            </LinkButton>
            <LinkButton href="/academy" tone="secondary">
              Academy
            </LinkButton>
            <LinkButton href="/shop" tone="secondary">
              Shop
            </LinkButton>
          </div>
        </Panel>

        <section className="grid gap-4 lg:col-span-2 md:grid-cols-3">
          {[
            {
              icon: <SudokuIcon className="h-7 w-7" />,
              title: "Clean Sudoku battles",
              text: "Readable board, notes, keyboard input, undo, and focused modifiers."
            },
            {
              icon: <SakuraIcon className="h-7 w-7" />,
              title: "Quiet campaign style",
              text: "Sakura Forest, Iron Citadel, Desert Archive, Neon Monastery, and Steppe Observatory."
            },
            {
              icon: <ScrollIcon className="h-7 w-7" />,
              title: "Local progress",
              text: "Academy, energy, inventory, coins, and conquered regions persist in your browser."
            }
          ].map((item) => (
            <Panel key={item.title}>
              <div className="grid h-12 w-12 place-items-center rounded-full bg-sakura text-ember">
                {item.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-bone">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-mist">{item.text}</p>
            </Panel>
          ))}
        </section>
      </section>
    </AppFrame>
  );
}
