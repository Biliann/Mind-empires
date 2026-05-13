# Mind Empires

Mind Empires is a Sudoku game wrapped in a small strategy campaign. You solve Sudoku boards, unlock new regions, earn energy and coins, and move through different themed battles.

## What it does

- Play Sudoku battles on the world map.
- Earn rewards when you finish a region.
- Use boosters, notes, undo, and keyboard input.
- Keep your progress in the browser.

## How to run it locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the app:
   ```bash
   npm run dev
   ```

3. Open the app in your browser:
   - http://localhost:3000
   - If port 3000 is busy, Next.js may choose another port like 3001 or 3002.

## Build for production

```bash
npm run build
npm run start
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in your own values.

Do not commit `.env.local` or any secret keys to GitHub.

## Main idea

The idea is simple: make Sudoku feel like a calm campaign instead of a plain puzzle. Each region adds a new challenge, and the game gives you a sense of progress as you conquer the map.