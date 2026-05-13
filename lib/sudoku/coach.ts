export type CoachCell = {
  row: number;
  col: number;
  candidates: number[];
};

export type CoachHint = {
  title: string;
  detail: string;
  target?: { row: number; col: number };
};

function digitName(value: number) {
  return String(value);
}

function cellName(row: number, col: number) {
  return `R${row + 1}C${col + 1}`;
}

function rowValues(board: number[][], row: number) {
  return new Set(board[row].filter(Boolean));
}

function colValues(board: number[][], col: number) {
  return new Set(board.map((row) => row[col]).filter(Boolean));
}

function boxValues(board: number[][], row: number, col: number) {
  const values = new Set<number>();
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r += 1) {
    for (let c = boxCol; c < boxCol + 3; c += 1) {
      if (board[r][c] !== 0) values.add(board[r][c]);
    }
  }
  return values;
}

export function isValidCoachBoard(board: unknown): board is number[][] {
  return (
    Array.isArray(board) &&
    board.length === 9 &&
    board.every(
      (row) =>
        Array.isArray(row) &&
        row.length === 9 &&
        row.every((value) => Number.isInteger(value) && value >= 0 && value <= 9)
    )
  );
}

export function candidatesForCell(board: number[][], row: number, col: number) {
  if (board[row][col] !== 0) return [];
  const used = new Set<number>([
    ...rowValues(board, row),
    ...colValues(board, col),
    ...boxValues(board, row, col)
  ]);
  return Array.from({ length: 9 }, (_, index) => index + 1).filter((value) => !used.has(value));
}

export function candidateMap(board: number[][]) {
  const cells: CoachCell[] = [];
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (board[row][col] === 0) {
        cells.push({ row, col, candidates: candidatesForCell(board, row, col) });
      }
    }
  }
  return cells;
}

function unitCells(unit: "row" | "col" | "box", index: number) {
  if (unit === "row") return Array.from({ length: 9 }, (_, col) => ({ row: index, col }));
  if (unit === "col") return Array.from({ length: 9 }, (_, row) => ({ row, col: index }));

  const boxRow = Math.floor(index / 3) * 3;
  const boxCol = (index % 3) * 3;
  const cells: Array<{ row: number; col: number }> = [];
  for (let row = boxRow; row < boxRow + 3; row += 1) {
    for (let col = boxCol; col < boxCol + 3; col += 1) {
      cells.push({ row, col });
    }
  }
  return cells;
}

function unitName(unit: "row" | "col" | "box", index: number) {
  if (unit === "row") return `row ${index + 1}`;
  if (unit === "col") return `column ${index + 1}`;
  return `box ${index + 1}`;
}

export function findCoachHint(board: number[][]): CoachHint {
  const cells = candidateMap(board);
  const contradiction = cells.find((cell) => cell.candidates.length === 0);
  if (contradiction) {
    return {
      title: "Check for a contradiction",
      detail: `${cellName(contradiction.row, contradiction.col)} has no legal candidates from its row, column, and box. Use undo or erase the last risky entry before continuing.`,
      target: { row: contradiction.row, col: contradiction.col }
    };
  }

  const nakedSingle = cells.find((cell) => cell.candidates.length === 1);
  if (nakedSingle) {
    return {
      title: "Naked single",
      detail: `${cellName(nakedSingle.row, nakedSingle.col)} can only be ${digitName(nakedSingle.candidates[0])}. Its row, column, and box already remove every other number.`,
      target: { row: nakedSingle.row, col: nakedSingle.col }
    };
  }

  for (const unit of ["row", "col", "box"] as const) {
    for (let index = 0; index < 9; index += 1) {
      const positions = unitCells(unit, index).filter(({ row, col }) => board[row][col] === 0);
      for (let digit = 1; digit <= 9; digit += 1) {
        const possible = positions.filter(({ row, col }) =>
          candidatesForCell(board, row, col).includes(digit)
        );
        if (possible.length === 1) {
          const target = possible[0];
          return {
            title: "Hidden single",
            detail: `In ${unitName(unit, index)}, only ${cellName(target.row, target.col)} can take ${digitName(digit)}. Scan that unit and confirm every other empty cell rejects ${digitName(digit)}.`,
            target
          };
        }
      }
    }
  }

  const best = [...cells]
    .filter((cell) => cell.candidates.length > 1)
    .sort((a, b) => a.candidates.length - b.candidates.length)[0];

  if (best) {
    return {
      title: "Most constrained cell",
      detail: `${cellName(best.row, best.col)} is a good next focus. Its candidates are ${best.candidates.join(", ")}. Compare those candidates against the other empty cells in row ${best.row + 1}, column ${best.col + 1}, and its 3x3 box.`,
      target: { row: best.row, col: best.col }
    };
  }

  return {
    title: "Grid complete",
    detail: "The board has no empty cells. If victory did not trigger, one placed number conflicts with the intended solution."
  };
}

export function formatBoard(board: number[][]) {
  return board.map((row) => row.map((value) => (value === 0 ? "." : String(value))).join(" ")).join("\n");
}
