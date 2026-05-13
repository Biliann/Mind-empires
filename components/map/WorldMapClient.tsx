"use client";

import { useState } from "react";
import { AppFrame } from "@/components/ui/AppFrame";
import { Button, LinkButton } from "@/components/ui/Button";
import { SakuraIcon, ScrollIcon, SudokuIcon, ToriiIcon } from "@/components/ui/GameIcons";
import { Eyebrow, Panel } from "@/components/ui/Panel";
import { getRegionStatus } from "@/lib/economy";
import { boosters, regions } from "@/lib/regions";
import { useProgress } from "@/lib/storage";
import { visualAssets } from "@/lib/visual-assets";

const mapShapes: Record<
  string,
  {
    path: string;
    label: { x: number; y: number };
    accent: string;
  }
> = {
  "sakura-forest": {
    path: "M92 196 C82 141 118 96 178 82 C229 70 272 88 304 129 L286 198 L224 234 L149 231 Z",
    label: { x: 194, y: 160 },
    accent: "#dbeafe"
  },
  "iron-citadel": {
    path: "M304 129 C353 91 429 91 486 126 L524 190 L485 247 L394 261 L286 198 Z",
    label: { x: 411, y: 181 },
    accent: "#e5e7eb"
  },
  "desert-archive": {
    path: "M149 231 L224 234 L286 198 L394 261 L382 344 L293 392 L183 359 L115 294 Z",
    label: { x: 270, y: 300 },
    accent: "#fef3c7"
  },
  "neon-monastery": {
    path: "M485 247 L524 190 C589 205 633 255 646 323 L610 401 L515 419 L382 344 L394 261 Z",
    label: { x: 526, y: 326 },
    accent: "#dcfce7"
  },
  "steppe-observatory": {
    path: "M183 359 L293 392 L382 344 L515 419 L486 497 L374 546 L244 517 L148 444 Z",
    label: { x: 338, y: 451 },
    accent: "#ede9fe"
  }
};

export function WorldMapClient() {
  const { progress, ready } = useProgress();
  const [focusedRegionId, setFocusedRegionId] = useState(regions[0].id);

  const focusedRegion =
    regions.find((region) => region.id === focusedRegionId) ?? regions[0];
  const focusedStatus = getRegionStatus(progress, focusedRegion.id);

  if (!ready) {
    return (
      <AppFrame>
        <Panel>
          <Eyebrow>Loading</Eyebrow>
          <h1 className="mt-2 text-2xl font-semibold text-bone">Preparing campaign map...</h1>
        </Panel>
      </AppFrame>
    );
  }

  return (
    <AppFrame>
      <header>
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-sakura text-ember">
            <ToriiIcon className="h-6 w-6" />
          </span>
          <Eyebrow>Campaign Map</Eyebrow>
        </div>
        <h1 className="mt-3 text-4xl font-semibold text-bone">Mental Empires</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-mist">
          Move over a province to reveal its master. Click an unlocked province to enter its Sudoku battle.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="map-grid overflow-hidden rounded-lg border border-black/10 bg-charcoal shadow-premium">
          <div className="relative p-3 sm:p-5">
            <svg
              className="h-auto w-full"
              viewBox="0 0 740 610"
              role="img"
              aria-label="Geographical campaign map of the Mental Empires"
            >
              <defs>
                <filter id="regionGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow
                    dx="0"
                    dy="0"
                    stdDeviation="8"
                    floodColor="#0066cc"
                    floodOpacity="0.24"
                  />
                </filter>
                <linearGradient id="seaWash" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#fbfbfd" />
                  <stop offset="100%" stopColor="#f5f5f7" />
                </linearGradient>
              </defs>
              <rect width="740" height="610" fill="url(#seaWash)" />
              <path
                d="M68 178 C54 93 139 31 242 48 C310 13 432 31 511 86 C594 93 683 171 689 288 C727 363 673 507 547 526 C474 596 312 583 226 538 C123 537 48 457 69 354 C24 296 28 224 68 178 Z"
                fill="#ffffff"
                stroke="rgba(0,0,0,0.1)"
                strokeWidth="3"
              />
              <path
                d="M92 196 C82 141 118 96 178 82 C229 70 272 88 304 129 C353 91 429 91 486 126 L524 190 C589 205 633 255 646 323 L610 401 L515 419 L486 497 L374 546 L244 517 L148 444 L183 359 L115 294 Z"
                fill="none"
                stroke="rgba(0,0,0,0.05)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {regions.map((region) => {
                const status = getRegionStatus(progress, region.id);
                const shape = mapShapes[region.id];
                const active = focusedRegionId === region.id;
                const isLocked = status === "locked";
                return (
                  <g key={region.id}>
                    <a
                      data-testid={`map-region-${region.id}`}
                      href={isLocked ? undefined : `/battle/${region.id}`}
                      role={isLocked ? "button" : undefined}
                      tabIndex={0}
                      aria-label={`${region.name}, ${status}`}
                      aria-disabled={isLocked}
                      onMouseEnter={() => setFocusedRegionId(region.id)}
                      onFocus={() => setFocusedRegionId(region.id)}
                      onClick={(event) => {
                        if (isLocked) {
                          event.preventDefault();
                          setFocusedRegionId(region.id);
                        }
                      }}
                      onKeyDown={(event) => {
                        if (isLocked && (event.key === "Enter" || event.key === " ")) {
                          event.preventDefault();
                          setFocusedRegionId(region.id);
                        }
                      }}
                      className={`cursor-pointer outline-none transition duration-200 ${
                        isLocked ? "cursor-not-allowed opacity-45" : ""
                      }`}
                    >
                      <path
                        d={shape.path}
                        fill={active ? shape.accent : isLocked ? "#f2f2f4" : "#ffffff"}
                        stroke={active ? "#0066cc" : "rgba(0,0,0,0.16)"}
                        strokeWidth={active ? 5 : 2}
                        filter={active && !isLocked ? "url(#regionGlow)" : undefined}
                      />
                      <circle
                        cx={shape.label.x}
                        cy={shape.label.y}
                        r={active ? 8 : 5}
                        fill={isLocked ? "#86868b" : "#0066cc"}
                      />
                      <text
                        x={shape.label.x}
                        y={shape.label.y - 15}
                        textAnchor="middle"
                        className="pointer-events-none select-none fill-bone text-[18px] font-semibold"
                      >
                        {region.name.split(" ")[0]}
                      </text>
                    </a>
                  </g>
                );
              })}

              <path
                d="M92 196 L149 231 L183 359 M286 198 L293 392 M394 261 L382 344 M515 419 L610 401"
                fill="none"
                stroke="rgba(0,0,0,0.18)"
                strokeWidth="2"
                strokeDasharray="7 8"
              />
            </svg>
          </div>
        </div>

        <Panel className="flex flex-col justify-between gap-5">
          <div>
            <div className="mb-4 overflow-hidden rounded-lg border border-black/10">
              <img
                src={visualAssets.sakuraStreet}
                alt="Sakura street in Japan"
                className="image-soft h-36 w-full object-cover"
              />
            </div>
            <p className="text-xs uppercase tracking-[0.14em] text-ember">
              {focusedStatus}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-bone">
              {focusedRegion.name}
            </h2>
            <p className="mt-2 text-sm font-semibold text-mist">
              {focusedRegion.master.name}
            </p>
            <p className="text-xs text-steel">{focusedRegion.master.title}</p>
            <div className="mt-5 space-y-3 text-sm text-mist">
              <p>{focusedRegion.description}</p>
              <p>
                <span className="text-bone">Difficulty:</span>{" "}
                {focusedRegion.difficulty}
              </p>
              <p>
                <span className="text-bone">Modifier:</span>{" "}
                {focusedRegion.modifierName}
              </p>
              <p>
                <span className="text-bone">Reward:</span>{" "}
                {focusedRegion.reward.coins} coins, {focusedRegion.reward.xp} XP
              </p>
            </div>
          </div>
          {focusedStatus === "locked" ? (
            <Button tone="ghost" disabled>
              Locked Province
            </Button>
          ) : (
            <LinkButton href={`/battle/${focusedRegion.id}`}>
              {focusedStatus === "conquered" ? "Replay Battle" : "Enter Battle"}
            </LinkButton>
          )}
        </Panel>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {regions.map((region) => {
          const status = getRegionStatus(progress, region.id);
          return (
            <Panel
              key={region.id}
              className={`flex min-h-[360px] flex-col justify-between ${
                status === "locked" ? "opacity-55" : ""
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-sakura text-ember">
                      {region.id === "sakura-forest" ? (
                        <SakuraIcon className="h-6 w-6" />
                      ) : region.id === "iron-citadel" ? (
                        <SudokuIcon className="h-6 w-6" />
                      ) : region.id === "desert-archive" ? (
                        <ScrollIcon className="h-6 w-6" />
                      ) : (
                        <ToriiIcon className="h-6 w-6" />
                      )}
                    </div>
                    <p className="text-xs uppercase tracking-[0.14em] text-ember">
                      {status}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-bone">{region.name}</h2>
                  </div>
                  <span className="rounded border border-gold/15 px-2 py-1 text-xs text-gold">
                    {region.difficulty}
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold text-mist">
                  {region.master.name}
                </p>
                <p className="text-xs text-steel">{region.master.title}</p>
                <div className="mt-4 space-y-3 text-sm text-mist">
                  <p>
                    <span className="text-bone">Modifier:</span> {region.modifierName}
                  </p>
                  <p>
                    <span className="text-bone">Rule:</span> {region.battleRule}
                  </p>
                  <p>
                    <span className="text-bone">Reward:</span> {region.reward.coins} coins,{" "}
                    {region.reward.xp} XP
                  </p>
                  <p>
                    <span className="text-bone">Booster:</span>{" "}
                    {boosters[region.recommendedBooster].name}
                  </p>
                </div>
              </div>
              {status === "locked" ? (
                <Button tone="ghost" disabled>
                  Locked Province
                </Button>
              ) : (
                <LinkButton href={`/battle/${region.id}`}>
                  {status === "conquered" ? "Replay Master" : "Challenge Master"}
                </LinkButton>
              )}
            </Panel>
          );
        })}
      </section>
    </AppFrame>
  );
}
