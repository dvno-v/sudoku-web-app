/**
 * Puzzle generator.
 *
 * Two stages: fill an empty board with a randomised solve to get a complete,
 * valid solution, then dig holes out of it. A hole is only kept if the puzzle
 * still has exactly one solution -- that guarantee is what lets "Check" mark an
 * answer wrong with confidence, and it is why this replaces the suGOku API.
 */

import { EMPTY, allCells, cloneGrid, countClues, createEmptyGrid, shuffle } from './grid.js';
import { countSolutions, solve } from './solver.js';

export const DIFFICULTIES = ['easy', 'medium', 'hard'];

/**
 * How many clues to aim for. These are targets rather than guarantees: digging
 * stops early if no further cell can be removed without making the puzzle
 * ambiguous, so a "hard" board occasionally lands a clue or two above target.
 */
const CLUE_TARGETS = {
    4: { easy: 9, medium: 7, hard: 5 },
    6: { easy: 20, medium: 16, hard: 12 },
    9: { easy: 42, medium: 34, hard: 27 },
};

export function clueTarget(size, difficulty) {
    const targets = CLUE_TARGETS[size];
    if (!targets) {
        throw new Error(`Unsupported board size: ${size}`);
    }
    const target = targets[difficulty];
    if (target === undefined) {
        throw new Error(`Unknown difficulty: ${difficulty}`);
    }
    return target;
}

/** A complete, valid board. Randomised, so callers get a fresh one each time. */
export function generateSolution(size, rng = Math.random) {
    const grid = createEmptyGrid(size);
    solve(grid, { random: true, rng });
    return grid;
}

/**
 * Generates a puzzle with exactly one solution.
 *
 * Returns the puzzle, the solution it was carved from, and the clue count that
 * was actually reached.
 */
export function generatePuzzle({ size = 9, difficulty = 'medium', rng = Math.random } = {}) {
    const target = clueTarget(size, difficulty);
    const solution = generateSolution(size, rng);
    const puzzle = cloneGrid(solution);

    let clues = size * size;
    for (const [row, col] of shuffle(allCells(size), rng)) {
        if (clues <= target) break;

        const removed = puzzle[row][col];
        puzzle[row][col] = EMPTY;

        if (countSolutions(puzzle, 2) === 1) {
            clues--;
        } else {
            puzzle[row][col] = removed;
        }
    }

    return { puzzle, solution, size, difficulty, clues: countClues(puzzle) };
}
