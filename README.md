# sudoku-web-app

A sudoku web app with 4x4, 6x6 and 9x9 boards. Puzzles are generated locally and
are guaranteed to have exactly one solution. No dependencies, no build step —
plain ES modules, so the browser loads the source as written.

## Running it

```bash
npm start        # serves the app at http://localhost:8080
npm test         # runs the solver, generator and layout tests
```

`npm start` uses a small static server (`scripts/serve.js`) because browsers
refuse to load ES modules over `file://`. Nothing to install first.

## How it works

- **`src/sudoku/grid.js`** — grid primitives and the box shape of each board
  size. A 6x6 has 2-row by 3-column boxes, which is what makes it a different
  puzzle from the others.
- **`src/sudoku/solver.js`** — backtracking solver. It always descends into the
  cell with the fewest candidates, which keeps `countSolutions()` cheap enough
  for the generator to call it once per removed clue.
- **`src/sudoku/generator.js`** — fills an empty board with a randomised solve,
  then removes clues one at a time, keeping a removal only while the puzzle
  still has a single solution.
- **`src/ui/`** — board rendering and toasts. Everything above this layer works
  on plain number matrices.

## Playing

Type 1–9, move with the arrow keys. Cells that break a sudoku rule are
highlighted as you type; **Check** compares against the real solution and flags
what is wrong. **Solve** reveals the answer, **Reset** returns to the starting
position, and **New puzzle** generates a fresh one at the chosen difficulty.

## TODOs

1. ~~Fix the backtracking algorithm, which is used for solving the sudoku~~ — done
2. ~~Implement the solve sudoku functionality~~ — done
3. ~~Real time solving~~ — done, conflicts are highlighted on every keystroke
4. ~~Stop using the suGOku API~~ — done, puzzles are generated locally
5. ~~Make an algorithm that generates sudokus~~ — done

Ideas if I pick this up again: pencil marks, undo history, a hint button, and
saving the current board to `localStorage`.
