/**
 * Backtracking solver.
 *
 * Two details keep it fast enough to run in the browser on every keystroke:
 * candidates are computed per cell, and the search always descends into the
 * cell with the fewest of them (minimum remaining values). That prunes most of
 * the tree before it is ever built, which matters for countSolutions() -- the
 * generator calls it once per dug hole.
 */

import { EMPTY, boxDimensions, cloneGrid, shuffle } from './grid.js';

/**
 * Values that could legally go into an empty cell, given its row, column and box.
 */
export function candidatesFor(grid, row, col) {
    const size = grid.length;
    const { rows: boxRows, cols: boxCols } = boxDimensions(size);
    const used = new Set();

    for (let i = 0; i < size; i++) {
        used.add(grid[row][i]);
        used.add(grid[i][col]);
    }

    const boxRowStart = row - (row % boxRows);
    const boxColStart = col - (col % boxCols);
    for (let r = boxRowStart; r < boxRowStart + boxRows; r++) {
        for (let c = boxColStart; c < boxColStart + boxCols; c++) {
            used.add(grid[r][c]);
        }
    }

    const candidates = [];
    for (let value = 1; value <= size; value++) {
        if (!used.has(value)) {
            candidates.push(value);
        }
    }
    return candidates;
}

/**
 * Whether `value` may be placed at [row, col]. The cell's own content is
 * ignored, so this answers "would this placement be legal" for filled cells too.
 */
export function isPlacementValid(grid, row, col, value) {
    const size = grid.length;
    const { rows: boxRows, cols: boxCols } = boxDimensions(size);

    if (value < 1 || value > size) {
        return false;
    }

    for (let i = 0; i < size; i++) {
        if (i !== col && grid[row][i] === value) return false;
        if (i !== row && grid[i][col] === value) return false;
    }

    const boxRowStart = row - (row % boxRows);
    const boxColStart = col - (col % boxCols);
    for (let r = boxRowStart; r < boxRowStart + boxRows; r++) {
        for (let c = boxColStart; c < boxColStart + boxCols; c++) {
            if ((r !== row || c !== col) && grid[r][c] === value) return false;
        }
    }

    return true;
}

/** The empty cell with the fewest candidates, or null when the grid is full. */
function findMostConstrainedCell(grid) {
    let best = null;

    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid.length; col++) {
            if (grid[row][col] !== EMPTY) continue;

            const candidates = candidatesFor(grid, row, col);
            if (!best || candidates.length < best.candidates.length) {
                best = { row, col, candidates };
                // A dead end (0) or a forced move (1) cannot be improved upon.
                if (candidates.length <= 1) return best;
            }
        }
    }

    return best;
}

/**
 * Solves in place and reports whether a solution was found. Pass `random: true`
 * to have candidates tried in random order, which is how the generator builds a
 * different full board every time.
 */
export function solve(grid, { random = false, rng = Math.random } = {}) {
    const cell = findMostConstrainedCell(grid);
    if (!cell) {
        return true;
    }

    const candidates = random ? shuffle(cell.candidates, rng) : cell.candidates;
    for (const value of candidates) {
        grid[cell.row][cell.col] = value;
        if (solve(grid, { random, rng })) {
            return true;
        }
        grid[cell.row][cell.col] = EMPTY;
    }

    return false;
}

/** Solves a copy, leaving the caller's grid untouched. Returns null if unsolvable. */
export function solvedCopy(grid, options) {
    const copy = cloneGrid(grid);
    return solve(copy, options) ? copy : null;
}

/**
 * Counts solutions, stopping once `limit` have been found -- the result is
 * therefore min(total, limit). The generator only ever needs to know "exactly
 * one or more than one", so the default limit of 2 keeps the search short.
 */
export function countSolutions(grid, limit = 2) {
    const working = cloneGrid(grid);

    const search = () => {
        const cell = findMostConstrainedCell(working);
        if (!cell) {
            return 1;
        }

        let found = 0;
        for (const value of cell.candidates) {
            working[cell.row][cell.col] = value;
            found += search();
            working[cell.row][cell.col] = EMPTY;
            if (found >= limit) break;
        }
        return found;
    };

    // A subtree can push the running total past the limit before the loop
    // breaks, so clamp to keep the documented min(total, limit) contract.
    return Math.min(search(), limit);
}

export function hasUniqueSolution(grid) {
    return countSolutions(grid, 2) === 1;
}

/**
 * Cells whose value collides with another filled cell in the same row, column
 * or box. Both sides of a collision are reported, so the UI can flag the pair.
 * Returned as "row,col" keys for cheap lookup while rendering.
 */
export function findConflicts(grid) {
    const conflicts = new Set();

    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid.length; col++) {
            const value = grid[row][col];
            if (value === EMPTY) continue;

            if (!isPlacementValid(grid, row, col, value)) {
                conflicts.add(`${row},${col}`);
            }
        }
    }

    return conflicts;
}
