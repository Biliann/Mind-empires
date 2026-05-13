"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { AppFrame } from "@/components/ui/AppFrame";
import { Button, LinkButton } from "@/components/ui/Button";
import { Eyebrow, Panel, Stat } from "@/components/ui/Panel";
import {
  BATTLE_ENERGY_COST,
  MAX_MISTAKES,
  completeRegion,
  getRegionStatus,
  spendBattleEnergy,
  useInventoryBooster
} from "@/lib/economy";
import { boosters, getRegion } from "@/lib/regions";
import { useProgress } from "@/lib/storage";
import {
  cellKey,
  cloneGrid,
  completedUnits,
  emptyNotes,
  fogCellsForPuzzle,
  isComplete,
  isGiven,
  linkedPairs,
  peersForCell
} from "@/lib/sudoku";
import type { BoosterId, Region } from "@/types/game";

type Phase = "intro" | "active" | "victory" | "defeat";
type SelectedCell = { row: number; col: number } | null;
type VictorySummary = {
  coinsEarned: number;
  xpEarned: number;
  unlockedRegionId: string;
  unlockedRegionName: string;
};
type CoachMessage = {
  role: "user" | "assistant";
  content: string;
  meta?: string;
};

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function inCompletedUnit(unit: string, row: number, col: number) {
  if (unit === `r${row}` || unit === `c${col}`) return true;
  const boxRow = Math.floor(row / 3);
  const boxCol = Math.floor(col / 3);
  return unit === `b${boxRow}${boxCol}`;
}

function firstPlayableCell(givens: number[][]) {
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (!isGiven(givens, row, col)) return { row, col };
    }
  }
  return { row: 0, col: 0 };
}

function inSameBox(a: SelectedCell, row: number, col: number) {
  if (!a) return false;
  return Math.floor(a.row / 3) === Math.floor(row / 3) && Math.floor(a.col / 3) === Math.floor(col / 3);
}

function nextPlayableCell(
  board: number[][],
  givens: number[][],
  row: number,
  col: number
) {
  for (let offset = 1; offset <= 81; offset += 1) {
    const index = row * 9 + col + offset;
    const nextRow = Math.floor(index / 9) % 9;
    const nextCol = index % 9;
    if (!isGiven(givens, nextRow, nextCol) && board[nextRow][nextCol] === 0) {
      return { row: nextRow, col: nextCol };
    }
  }
  return { row, col };
}

function hasSameValueConflict(board: number[][], row: number, col: number, value: number) {
  if (value === 0) return false;
  return peersForCell(row, col).some((peer) => board[peer.row][peer.col] === value);
}

function AiCoach({
  region,
  board,
  notes,
  selected,
  mistakes,
  timer,
  notesMode,
  fogKeys,
  fadedGivenKeys,
  focusNotesLeft,
  starHighlights
}: {
  region: Region;
  board: number[][];
  notes: string[][][];
  selected: SelectedCell;
  mistakes: number;
  timer: number;
  notesMode: boolean;
  fogKeys: Set<string>;
  fadedGivenKeys: string[];
  focusNotesLeft: number;
  starHighlights: string[];
}) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      role: "assistant",
      content: "Tap Ask for Hint when you want a logical next step from the current board."
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function askCoach(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (loading) return;

    const userText = question.trim() || "Give me the best next logical hint.";
    const nextMessages: CoachMessage[] = [...messages, { role: "user", content: userText }];
    setMessages(nextMessages);
    setQuestion("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          regionId: region.id,
          board,
          notes,
          selected,
          mistakes,
          timerSeconds: timer,
          notesMode,
          question: userText,
          chatHistory: nextMessages.slice(-6),
          modifierState: {
            fogCellsRemaining: fogKeys.size,
            fadedGivenCells: fadedGivenKeys,
            focusNotesLeft,
            starHighlights
          }
        })
      });
      const payload = (await response.json()) as {
        advice?: string;
        error?: string;
        source?: "kimi" | "local";
        model?: string;
        providerMessage?: string;
      };
      if (!response.ok || !payload.advice) {
        throw new Error(payload.error ?? "Coach could not answer.");
      }
      const meta =
        payload.source === "kimi"
          ? `Live Kimi${payload.model ? ` · ${payload.model}` : ""}`
          : payload.providerMessage ?? "Local Sudoku fallback";
      setMessages((current) => [
        ...current,
        { role: "assistant", content: payload.advice ?? "", meta }
      ]);
    } catch (coachError) {
      setError(coachError instanceof Error ? coachError.message : "Coach could not answer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="mb-3 w-[calc(100vw-2.5rem)] max-w-[390px] rounded-xl border border-black/10 bg-white/95 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ember">
                AI Coach
              </p>
              <h2 className="mt-1 text-lg font-semibold text-bone">Sudoku Sensei</h2>
            </div>
            <button
              aria-label="Close AI coach"
              className="rounded-full border border-black/10 px-3 py-1 text-sm text-mist transition hover:bg-sakura/40 hover:text-bone"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>

          <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-lg border p-3 text-sm leading-6 ${
                  message.role === "assistant"
                    ? "border-black/10 bg-washi text-bone"
                    : "border-gold/20 bg-gold/10 text-bone"
                }`}
              >
                {message.meta ? (
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ember">
                    {message.meta}
                  </p>
                ) : null}
                {message.content}
              </div>
            ))}
            {loading ? (
              <div className="rounded-lg border border-black/10 bg-washi p-3 text-sm text-mist">
                Reading the grid...
              </div>
            ) : null}
          </div>

          {error ? (
            <p className="mt-3 rounded-md border border-blood/20 bg-blood/10 p-2 text-sm text-blood">
              {error}
            </p>
          ) : null}

          <form className="mt-4 grid gap-2" onSubmit={askCoach}>
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask for a hint, candidate check, or strategy..."
              rows={3}
              className="min-h-24 resize-none rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-bone outline-none transition focus:border-gold"
            />
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" tone="secondary" disabled={loading} onClick={() => askCoach()}>
                Ask for Hint
              </Button>
              <Button type="submit" disabled={loading}>
                Send
              </Button>
            </div>
          </form>
        </div>
      ) : null}
      <button
        aria-label="Open AI Sudoku coach"
        className="grid h-14 w-14 place-items-center rounded-full border border-gold/25 bg-sumi text-sm font-semibold text-white shadow-[0_14px_35px_rgba(0,0,0,0.24)] transition hover:-translate-y-0.5 hover:bg-gold"
        onClick={() => setOpen((current) => !current)}
      >
        AI
      </button>
    </div>
  );
}

function MasterIntro({
  region,
  energy,
  onStart
}: {
  region: Region;
  energy: number;
  onStart: () => void;
}) {
  const recommended = boosters[region.recommendedBooster];

  return (
    <AppFrame>
      <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <Panel>
          <Eyebrow>{region.name}</Eyebrow>
          <h1 className="mt-2 font-serif text-4xl text-bone">{region.master.name}</h1>
          <p className="mt-1 text-lg text-gold">{region.master.title}</p>
          <blockquote className="mt-6 border-l-2 border-gold/40 pl-4 text-lg text-mist">
            “{region.master.dialogue}”
          </blockquote>
        </Panel>
        <Panel>
          <h2 className="text-2xl font-semibold text-bone">Battle Briefing</h2>
          <div className="mt-4 space-y-4 text-sm text-mist">
            <p>{region.description}</p>
            <p>
              <span className="text-bone">Rules:</span> {region.battleRule}
            </p>
            <p>
              <span className="text-bone">Recommended booster:</span>{" "}
              {recommended.name} — {recommended.description}
            </p>
            <p>
              <span className="text-bone">Energy cost:</span> {BATTLE_ENERGY_COST}
            </p>
          </div>
          {energy <= 0 ? (
            <div className="mt-5 grid gap-3">
              <p className="rounded-md border border-blood/35 bg-blood/15 p-3 text-sm text-bone">
                You need energy to start a battle.
              </p>
              <LinkButton href="/shop">Go to Shop</LinkButton>
            </div>
          ) : (
            <Button className="mt-5 w-full" onClick={onStart}>
              Start Battle
            </Button>
          )}
        </Panel>
      </section>
    </AppFrame>
  );
}

export function BattleClient({ regionId }: { regionId: string }) {
  const region = getRegion(regionId);
  const { progress, setProgress, ready } = useProgress();
  const [phase, setPhase] = useState<Phase>("intro");
  const [board, setBoard] = useState<number[][]>(() =>
    region ? cloneGrid(region.puzzle.givens) : []
  );
  const [notes, setNotes] = useState<string[][][]>(() => emptyNotes());
  const [selected, setSelected] = useState<SelectedCell>(null);
  const [notesMode, setNotesMode] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [timer, setTimer] = useState(0);
  const [boostersUsed, setBoostersUsed] = useState<BoosterId[]>([]);
  const [undoStack, setUndoStack] = useState<number[][][]>([]);
  const [fogKeys, setFogKeys] = useState<Set<string>>(new Set());
  const [fadedGivenKeys, setFadedGivenKeys] = useState<string[]>([]);
  const [memoryPausedUntil, setMemoryPausedUntil] = useState(0);
  const [focusNotesLeft, setFocusNotesLeft] = useState(0);
  const [hintText, setHintText] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [starHighlights, setStarHighlights] = useState<string[]>([]);
  const [victory, setVictory] = useState<VictorySummary>({
    coinsEarned: 0,
    xpEarned: 0,
    unlockedRegionId: "",
    unlockedRegionName: ""
  });
  const lastFadeSecond = useRef(0);
  const battleAreaRef = useRef<HTMLDivElement>(null);

  const initialFogKeys = useMemo(() => {
    if (!region) return new Set<string>();
    return new Set(fogCellsForPuzzle(region.puzzle.givens).map((cell) => cellKey(cell.row, cell.col)));
  }, [region]);

  useEffect(() => {
    if (phase !== "active") return;
    const interval = window.setInterval(() => setTimer((current) => current + 1), 1000);
    return () => window.clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (!region || phase !== "active" || region.modifier !== "vanishing-clues") return;
    if (timer === 0 || timer % 90 !== 0 || lastFadeSecond.current === timer) return;
    if (timer < memoryPausedUntil) return;
    lastFadeSecond.current = timer;

    const givenKeys: string[] = [];
    for (let row = 0; row < 9; row += 1) {
      for (let col = 0; col < 9; col += 1) {
        if (isGiven(region.puzzle.givens, row, col)) givenKeys.push(cellKey(row, col));
      }
    }
    const next = givenKeys.find((key) => !fadedGivenKeys.includes(key));
    if (next) setFadedGivenKeys((current) => [...current, next]);
  }, [fadedGivenKeys, memoryPausedUntil, phase, region, timer]);

  if (!region) {
    return (
      <AppFrame>
        <Panel>
          <h1 className="text-2xl text-bone">Region not found</h1>
          <LinkButton className="mt-4" href="/map">
            Return to Map
          </LinkButton>
        </Panel>
      </AppFrame>
    );
  }

  const activeRegion = region;

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

  const status = getRegionStatus(progress, activeRegion.id);

  function resetBattleState() {
    setBoard(cloneGrid(activeRegion.puzzle.givens));
    setNotes(emptyNotes());
    setSelected(null);
    setNotesMode(false);
    setMistakes(0);
    setTimer(0);
    setBoostersUsed([]);
    setUndoStack([]);
    setFogKeys(new Set(initialFogKeys));
    setFadedGivenKeys([]);
    setMemoryPausedUntil(0);
    setFocusNotesLeft(0);
    setHintText("");
    setFeedbackText("");
    setStarHighlights([]);
    lastFadeSecond.current = 0;
  }

  function startBattle() {
    if (progress.energy < BATTLE_ENERGY_COST) return;
    resetBattleState();
    setSelected(firstPlayableCell(activeRegion.puzzle.givens));
    setProgress((current) =>
      current.energy >= BATTLE_ENERGY_COST ? spendBattleEnergy(current) : current
    );
    setPhase("active");
    window.setTimeout(() => battleAreaRef.current?.focus(), 0);
  }

  function revealFogFromCompletedUnits(nextBoard: number[][]) {
    if (activeRegion.modifier !== "fog-sudoku") return;
    const units = completedUnits(nextBoard, activeRegion.puzzle.solution);
    if (units.length === 0) return;
    setFogKeys((current) => {
      const next = new Set(current);
      for (const key of current) {
        const [rowText, colText] = key.split("-");
        const row = Number(rowText);
        const col = Number(colText);
        if (units.some((unit) => inCompletedUnit(unit, row, col))) next.delete(key);
      }
      return next;
    });
  }

  function revealStarPair(row: number, col: number) {
    if (activeRegion.modifier !== "star-link") return;
    for (const pair of linkedPairs()) {
      const [a, b] = pair;
      if (a.row === row && a.col === col) {
        setStarHighlights((current) => [...new Set([...current, cellKey(b.row, b.col)])]);
      }
      if (b.row === row && b.col === col) {
        setStarHighlights((current) => [...new Set([...current, cellKey(a.row, a.col)])]);
      }
    }
  }

  function finishVictory(finalMistakes: number) {
    setProgress((current) => {
      const result = completeRegion(current, activeRegion.id);
      setVictory({
        coinsEarned: result.coinsEarned,
        xpEarned: result.xpEarned,
        unlockedRegionId: result.unlockedRegionId,
        unlockedRegionName: result.unlockedRegionName
      });
      return result.progress;
    });
    setMistakes(finalMistakes);
    setPhase("victory");
  }

  function placeNumber(value: number) {
    if (!selected || phase !== "active") return;
    const { row, col } = selected;
    if (isGiven(activeRegion.puzzle.givens, row, col)) return;
    if (board[row][col] === value) return;

    if (notesMode) {
      if (activeRegion.modifier === "no-notes" && focusNotesLeft <= 0) return;
      if (board[row][col] !== 0) return;
      setNotes((current) => {
        const next = current.map((noteRow) => noteRow.map((cellNotes) => [...cellNotes]));
        const text = String(value);
        const hasNote = next[row][col].includes(text);
        next[row][col] = hasNote
          ? next[row][col].filter((note) => note !== text)
          : [...next[row][col], text].sort();
        if (!hasNote && activeRegion.modifier === "no-notes") {
          setFocusNotesLeft((remaining) => Math.max(0, remaining - 1));
        }
        return next;
      });
      setFeedbackText("");
      return;
    }

    setUndoStack((current) => [...current, cloneGrid(board)]);
    const nextBoard = cloneGrid(board);
    nextBoard[row][col] = value;
    setBoard(nextBoard);
    setNotes((current) => {
      const next = current.map((noteRow) => noteRow.map((cellNotes) => [...cellNotes]));
      next[row][col] = [];
      return next;
    });

    const correct = value === activeRegion.puzzle.solution[row][col];
    if (!correct) {
      const nextMistakes = mistakes + 1;
      setMistakes(nextMistakes);
      setFeedbackText(`That placement breaks the grid. ${Math.max(0, MAX_MISTAKES - nextMistakes)} attempts left.`);
      if (nextMistakes >= MAX_MISTAKES) setPhase("defeat");
      return;
    }

    setFeedbackText("Good placement.");
    setNotes((current) => {
      const next = current.map((noteRow) => noteRow.map((cellNotes) => [...cellNotes]));
      for (const peer of peersForCell(row, col)) {
        next[peer.row][peer.col] = next[peer.row][peer.col].filter((note) => note !== String(value));
      }
      return next;
    });
    revealFogFromCompletedUnits(nextBoard);
    revealStarPair(row, col);
    if (isComplete(nextBoard, activeRegion.puzzle.solution)) {
      finishVictory(mistakes);
    } else {
      setSelected(nextPlayableCell(nextBoard, activeRegion.puzzle.givens, row, col));
    }
  }

  function eraseSelected() {
    if (!selected || phase !== "active") return;
    const { row, col } = selected;
    if (isGiven(activeRegion.puzzle.givens, row, col)) return;
    setUndoStack((current) => [...current, cloneGrid(board)]);
    setBoard((current) => {
      const next = cloneGrid(current);
      next[row][col] = 0;
      return next;
    });
    setNotes((current) => {
      const next = current.map((noteRow) => noteRow.map((cellNotes) => [...cellNotes]));
      next[row][col] = [];
      return next;
    });
    setFeedbackText("");
  }

  function undo() {
    const previous = undoStack.at(-1);
    if (!previous) return;
    setBoard(cloneGrid(previous));
    setUndoStack((current) => current.slice(0, -1));
    setFeedbackText("Move undone.");
  }

  function moveSelection(rowDelta: number, colDelta: number) {
    setSelected((current) => {
      const origin = current ?? firstPlayableCell(activeRegion.puzzle.givens);
      return {
        row: Math.min(8, Math.max(0, origin.row + rowDelta)),
        col: Math.min(8, Math.max(0, origin.col + colDelta))
      };
    });
  }

  function handleBattleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (phase !== "active") return;

    if (/^[1-9]$/.test(event.key)) {
      event.preventDefault();
      placeNumber(Number(event.key));
      return;
    }

    if (event.key === "Backspace" || event.key === "Delete" || event.key === "0") {
      event.preventDefault();
      eraseSelected();
      return;
    }

    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
      event.preventDefault();
      undo();
      return;
    }

    if (event.key.toLowerCase() === "n") {
      event.preventDefault();
      if (activeRegion.modifier !== "no-notes" || focusNotesLeft > 0) {
        setNotesMode((current) => !current);
      }
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveSelection(-1, 0);
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveSelection(1, 0);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveSelection(0, -1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveSelection(0, 1);
    }
  }

  function useBooster() {
    const boosterId = activeRegion.recommendedBooster;
    if (progress.inventory[boosterId] <= 0 || boostersUsed.includes(boosterId)) return;
    setProgress((current) => useInventoryBooster(current, boosterId));
    setBoostersUsed((current) => [...current, boosterId]);

    if (boosterId === "fog-breaker") {
      setFogKeys((current) => new Set([...current].slice(3)));
    }
    if (boosterId === "logic-hint") {
      setHintText("Find a row with only one missing value, then use the matching column to confirm it.");
    }
    if (boosterId === "memory-seal") {
      setMemoryPausedUntil(timer + 60);
      setHintText("Memory Seal active: clue fading is paused for 60 seconds.");
    }
    if (boosterId === "focus-token") {
      setFocusNotesLeft((current) => current + 3);
      setNotesMode(true);
      setHintText("Focus Token active: 3 temporary note placements available.");
    }
    if (boosterId === "star-reveal") {
      const pair = linkedPairs()[0];
      setStarHighlights([cellKey(pair[0].row, pair[0].col), cellKey(pair[1].row, pair[1].col)]);
    }
  }

  if (status === "locked") {
    return (
      <AppFrame>
        <Panel>
          <Eyebrow>Locked Region</Eyebrow>
          <h1 className="mt-2 text-2xl font-semibold text-bone">{activeRegion.name}</h1>
          <p className="mt-2 text-mist">Conquer previous regions to challenge this master.</p>
          <LinkButton className="mt-5" href="/map">
            Return to Map
          </LinkButton>
        </Panel>
      </AppFrame>
    );
  }

  if (phase === "intro") {
    return <MasterIntro region={activeRegion} energy={progress.energy} onStart={startBattle} />;
  }

  if (phase === "victory") {
    return (
      <AppFrame>
        <Panel>
          <Eyebrow>Victory</Eyebrow>
          <h1 className="mt-2 font-serif text-4xl text-bone">{activeRegion.name} Conquered</h1>
          <p className="mt-4 text-mist">{activeRegion.victoryText}</p>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
            <Stat label="Time" value={formatTime(timer)} />
            <Stat label="Mistakes" value={mistakes} />
            <Stat label="Boosters" value={boostersUsed.length} />
            <Stat label="Coins" value={`+${victory.coinsEarned}`} />
            <Stat label="Academy XP" value={`+${victory.xpEarned}`} />
            <Stat
              label="Unlocked"
              value={victory.unlockedRegionName || "No new region"}
            />
          </div>
          {victory.unlockedRegionName ? (
            <p className="mt-5 rounded-md border border-gold/20 bg-gold/10 p-3 text-sm text-bone">
              New level opened on the World Map: {victory.unlockedRegionName}.
            </p>
          ) : null}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <LinkButton href="/map">World Map</LinkButton>
            {victory.unlockedRegionId ? (
              <LinkButton href={`/battle/${victory.unlockedRegionId}`} tone="secondary">
                Challenge New Level
              </LinkButton>
            ) : (
              <Button tone="secondary" onClick={() => setPhase("intro")}>
                Challenge Again
              </Button>
            )}
          </div>
        </Panel>
      </AppFrame>
    );
  }

  if (phase === "defeat") {
    return (
      <AppFrame>
        <Panel>
          <Eyebrow>Defeat</Eyebrow>
          <h1 className="mt-2 font-serif text-4xl text-bone">{activeRegion.master.name} Holds</h1>
          <blockquote className="mt-4 border-l-2 border-blood/60 pl-4 text-mist">
            “{activeRegion.master.defeatDialogue}”
          </blockquote>
          <p className="mt-5 text-sm text-mist">
            Suggested booster: {boosters[activeRegion.recommendedBooster].name}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button onClick={startBattle} disabled={progress.energy < BATTLE_ENERGY_COST}>
              Try Again
            </Button>
            <LinkButton href="/shop" tone="secondary">
              Go to Shop
            </LinkButton>
          </div>
        </Panel>
      </AppFrame>
    );
  }

  const selectedValue = selected ? board[selected.row][selected.col] : 0;

  return (
    <AppFrame>
      <section
        ref={battleAreaRef}
        tabIndex={-1}
        onKeyDown={handleBattleKeyDown}
        className="grid gap-3 sm:gap-4 outline-none lg:grid-cols-[1fr_320px]"
      >
        <Panel className="overflow-hidden">
          <div className="mb-4 grid gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
            <div>
              <Eyebrow>{activeRegion.modifierName}</Eyebrow>
              <h1 className="mt-1 text-xl sm:text-2xl font-semibold text-bone">{activeRegion.name}</h1>
            </div>
            <div className="flex gap-2 text-xs sm:text-sm">
              <span className="rounded border border-gold/10 bg-obsidian/60 px-2 sm:px-3 py-2 text-gold">
                {formatTime(timer)}
              </span>
              <span className="rounded border border-gold/10 bg-obsidian/60 px-2 sm:px-3 py-2 text-bone">
                {mistakes}/{MAX_MISTAKES}
              </span>
            </div>
          </div>

          <div className="mx-auto grid w-full max-w-[90vw] sm:max-w-[560px] grid-rows-9 overflow-hidden rounded-md border-2 border-black/20 bg-black/10">
            {board.map((rowValues, row) => (
              <div key={row} className="sudoku-row grid grid-cols-9">
                {rowValues.map((value, col) => {
                  const key = cellKey(row, col);
                  const given = isGiven(activeRegion.puzzle.givens, row, col);
                  const isSelected = selected?.row === row && selected.col === col;
                  const related =
                    selected?.row === row || selected?.col === col || inSameBox(selected, row, col);
                  const sameValue = selectedValue !== 0 && value === selectedValue;
                  const incorrect =
                    value !== 0 && value !== activeRegion.puzzle.solution[row][col];
                  const conflict = hasSameValueConflict(board, row, col, value);
                  const fogged = fogKeys.has(key);
                  const faded = fadedGivenKeys.includes(key);
                  const star = starHighlights.includes(key);
                  return (
                    <button
                      key={key}
                      data-testid={`cell-${row}-${col}`}
                      aria-label={`Cell ${row + 1}, ${col + 1}${value ? `, ${value}` : ""}${fogged ? ", fogged" : ""}`}
                      className={`sudoku-cell relative aspect-square min-h-[32px] sm:min-h-[44px] border border-black/10 text-center transition text-sm sm:text-lg ${
                        given ? "bg-ink text-bone" : "bg-charcoal text-gold"
                      } ${related && !isSelected ? "bg-gold/10" : ""} ${
                        incorrect || conflict ? "bg-blood/10 text-blood" : ""
                      } ${isSelected ? "ring-2 ring-gold ring-inset" : ""} ${
                        sameValue ? "bg-ember/35" : ""
                      } ${star ? "shadow-[inset_0_0_0_2px_rgba(0,102,204,0.85)]" : ""}`}
                      onClick={() => setSelected({ row, col })}
                    >
                      {value !== 0 ? (
                        <span
                          className={`font-semibold ${
                            faded ? "opacity-25" : ""
                          }`}
                        >
                          {value}
                        </span>
                      ) : notes[row][col].length > 0 ? (
                        <span className="grid h-full grid-cols-3 place-items-center p-0.5 text-[8px] sm:text-[10px] text-mist">
                          {Array.from({ length: 9 }, (_, index) => {
                            const note = String(index + 1);
                            return <span key={note}>{notes[row][col].includes(note) ? note : ""}</span>;
                          })}
                        </span>
                      ) : null}
                      {fogged ? (
                        <span className="fog-overlay" aria-hidden="true" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="grid grid-cols-3 gap-1.5 md:hidden">
            {Array.from({ length: 9 }, (_, index) => index + 1).map((value) => (
              <Button
                key={value}
                data-testid={`number-${value}`}
                tone="secondary"
                className="min-h-10 text-sm py-1"
                onClick={() => placeNumber(value)}
              >
                {value}
              </Button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-2.5">
            <Button
              tone={notesMode ? "primary" : "secondary"}
              disabled={activeRegion.modifier === "no-notes" && focusNotesLeft <= 0}
              onClick={() => setNotesMode((current) => !current)}
              className="text-xs sm:text-sm"
            >
              Notes {activeRegion.modifier === "no-notes" ? `(${focusNotesLeft})` : ""}
            </Button>
            <Button tone="secondary" onClick={eraseSelected} className="text-xs sm:text-sm">
              Erase
            </Button>
            <Button tone="secondary" onClick={undo} disabled={undoStack.length === 0} className="text-xs sm:text-sm">
              Undo
            </Button>
            <Button
              tone="secondary"
              onClick={useBooster}
              disabled={
                progress.inventory[activeRegion.recommendedBooster] <= 0 ||
                boostersUsed.includes(activeRegion.recommendedBooster)
              }
              className="text-xs sm:text-sm"
            >
              Booster
            </Button>
          </div>

          <div className="mt-5 space-y-3 text-sm text-mist">
            <p>
              <span className="text-bone">Booster:</span>{" "}
              {boosters[activeRegion.recommendedBooster].name} x
              {progress.inventory[activeRegion.recommendedBooster]}
            </p>
            <p>
              <span className="text-bone">Rule:</span> {activeRegion.battleRule}
            </p>
            {hintText ? (
              <p className="rounded-md border border-gold/15 bg-obsidian/60 p-3 text-gold">
                {hintText}
              </p>
            ) : null}
            {feedbackText ? (
              <p className="rounded-md border border-black/10 bg-ink p-3 text-bone">
                {feedbackText}
              </p>
            ) : null}
            {activeRegion.modifier === "fog-sudoku" ? (
              <p>Fog cells remaining: {fogKeys.size}</p>
            ) : null}
            {activeRegion.modifier === "vanishing-clues" ? (
              <p>
                Faded clues: {fadedGivenKeys.length}
                {timer < memoryPausedUntil ? " · Memory Seal active" : ""}
              </p>
            ) : null}
          </div>

          <Link href="/map" className="mt-5 block text-center text-sm text-mist hover:text-bone">
            Leave battle
          </Link>
        </Panel>
      </section>
      <AiCoach
        region={activeRegion}
        board={board}
        notes={notes}
        selected={selected}
        mistakes={mistakes}
        timer={timer}
        notesMode={notesMode}
        fogKeys={fogKeys}
        fadedGivenKeys={fadedGivenKeys}
        focusNotesLeft={focusNotesLeft}
        starHighlights={starHighlights}
      />
    </AppFrame>
  );
}
