export type CellPosition = { row: number; col: number };

export function cloneGrid(grid: number[][]) {
  return grid.map((row) => [...row]);
}

export function emptyNotes() {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => [] as string[])
  );
}

export function isGiven(givens: number[][], row: number, col: number) {
  return givens[row][col] !== 0;
}

export function isComplete(board: number[][], solution: number[][]) {
  return board.every((row, rowIndex) =>
    row.every((value, colIndex) => value === solution[rowIndex][colIndex])
  );
}

export function completedUnits(board: number[][], solution: number[][]) {
  const units: string[] = [];
  for (let row = 0; row < 9; row += 1) {
    if (board[row].every((value, col) => value === solution[row][col])) {
      units.push(`r${row}`);
    }
  }
  for (let col = 0; col < 9; col += 1) {
    if (board.every((row, rowIndex) => row[col] === solution[rowIndex][col])) {
      units.push(`c${col}`);
    }
  }
  for (let boxRow = 0; boxRow < 3; boxRow += 1) {
    for (let boxCol = 0; boxCol < 3; boxCol += 1) {
      let complete = true;
      for (let row = boxRow * 3; row < boxRow * 3 + 3; row += 1) {
        for (let col = boxCol * 3; col < boxCol * 3 + 3; col += 1) {
          if (board[row][col] !== solution[row][col]) complete = false;
        }
      }
      if (complete) units.push(`b${boxRow}${boxCol}`);
    }
  }
  return units;
}

export function fogCellsForPuzzle(givens: number[][]) {
  const cells: CellPosition[] = [];
  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      if (!isGiven(givens, row, col) && (row + col) % 2 === 0) {
        cells.push({ row, col });
      }
    }
  }
  return cells.slice(0, 24);
}

export function cellKey(row: number, col: number) {
  return `${row}-${col}`;
}

export function peersForCell(row: number, col: number) {
  const peers = new Map<string, CellPosition>();
  for (let index = 0; index < 9; index += 1) {
    if (index !== col) peers.set(cellKey(row, index), { row, col: index });
    if (index !== row) peers.set(cellKey(index, col), { row: index, col });
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let peerRow = boxRow; peerRow < boxRow + 3; peerRow += 1) {
    for (let peerCol = boxCol; peerCol < boxCol + 3; peerCol += 1) {
      if (peerRow !== row || peerCol !== col) {
        peers.set(cellKey(peerRow, peerCol), { row: peerRow, col: peerCol });
      }
    }
  }

  return [...peers.values()];
}

export function linkedPairs() {
  return [
    [
      { row: 0, col: 2 },
      { row: 8, col: 6 }
    ],
    [
      { row: 1, col: 7 },
      { row: 6, col: 1 }
    ],
    [
      { row: 3, col: 4 },
      { row: 5, col: 4 }
    ]
  ] as const;
}
