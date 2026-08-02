import test from 'node:test';
import assert from 'node:assert/strict';

import { EMPTY, SUPPORTED_SIZES, boxDimensions, cloneGrid, createEmptyGrid, isFull } from '../src/sudoku/grid.js';
import { candidatesFor, countSolutions, findConflicts, isPlacementValid, solve, solvedCopy } from '../src/sudoku/solver.js';
import { assertSolvedGridIsValid } from './helpers.js';

const NINE = [
    [0, 0, 0, 0, 0, 0, 8, 0, 0],
    [0, 0, 4, 0, 0, 8, 0, 0, 9],
    [0, 7, 0, 0, 0, 0, 0, 0, 5],
    [0, 1, 0, 0, 7, 5, 0, 0, 8],
    [0, 5, 6, 0, 9, 1, 3, 0, 0],
    [7, 8, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 9, 3, 0, 0, 1, 0],
    [0, 0, 5, 7, 0, 0, 4, 0, 3],
];

const SIX = [
    [5, 0, 0, 0, 3, 4],
    [2, 0, 0, 5, 0, 1],
    [0, 0, 0, 0, 0, 0],
    [0, 5, 0, 0, 0, 6],
    [0, 2, 4, 6, 5, 3],
    [0, 0, 0, 1, 0, 0],
];

const FOUR = [
    [2, 0, 3, 0],
    [0, 0, 1, 2],
    [0, 0, 2, 0],
    [1, 0, 4, 0],
];

test('6x6 boxes are 2 rows by 3 columns', () => {
    assert.deepEqual(boxDimensions(6), { rows: 2, cols: 3 });
});

test('unsupported board sizes are rejected', () => {
    assert.throws(() => boxDimensions(5), /Unsupported board size/);
});

for (const [label, puzzle] of [['9x9', NINE], ['6x6', SIX], ['4x4', FOUR]]) {
    test(`solves the original ${label} puzzle into a valid grid`, () => {
        const solved = solvedCopy(puzzle);

        assert.ok(solved, `${label} puzzle should be solvable`);
        assert.ok(isFull(solved));
        assertSolvedGridIsValid(solved);
    });

    test(`solving ${label} preserves the given clues`, () => {
        const solved = solvedCopy(puzzle);

        for (let row = 0; row < puzzle.length; row++) {
            for (let col = 0; col < puzzle.length; col++) {
                if (puzzle[row][col] !== EMPTY) {
                    assert.equal(solved[row][col], puzzle[row][col], `clue at ${row},${col} was overwritten`);
                }
            }
        }
    });
}

test('solve() does not mutate the caller grid when using solvedCopy', () => {
    const original = cloneGrid(NINE);
    solvedCopy(NINE);
    assert.deepEqual(NINE, original);
});

// The old solver tried values 1..9 on every board, so a 4x4 could be "solved"
// with a 7 in it.
test('candidates never exceed the board size', () => {
    for (const size of SUPPORTED_SIZES) {
        const solved = createEmptyGrid(size);
        solve(solved, { random: true });

        for (const row of solved) {
            for (const value of row) {
                assert.ok(value >= 1 && value <= size, `value ${value} out of range for ${size}x${size}`);
            }
        }
    }
});

test('candidatesFor lists only values that are legal in the cell', () => {
    const grid = createEmptyGrid(4);
    grid[0][0] = 1;
    grid[0][2] = 2;
    grid[1][1] = 3;

    assert.deepEqual(candidatesFor(grid, 0, 1), [4]);
});

test('isPlacementValid ignores the cell being tested', () => {
    const grid = createEmptyGrid(4);
    grid[0][0] = 3;

    assert.ok(isPlacementValid(grid, 0, 0, 3), 'a cell must not conflict with itself');
    assert.ok(!isPlacementValid(grid, 0, 1, 3), 'row conflict should be rejected');
    assert.ok(!isPlacementValid(grid, 1, 0, 3), 'column conflict should be rejected');
    assert.ok(!isPlacementValid(grid, 1, 1, 3), 'box conflict should be rejected');
    assert.ok(!isPlacementValid(grid, 3, 3, 5), 'values above the board size are never valid');
});

test('an unsolvable grid reports no solution', () => {
    const grid = createEmptyGrid(4);
    grid[0][0] = 1;
    grid[0][1] = 2;
    grid[1][0] = 3;
    grid[1][1] = 4;
    // Row 2 now has to start with something, but column 0 and 1 are boxed in
    // such that this arrangement leaves cell [0][2]/[0][3] with 3 and 4 only.
    grid[0][2] = 3;
    grid[0][3] = 4;
    grid[2][2] = 3;

    assert.equal(solvedCopy(grid), null);
    assert.equal(countSolutions(grid), 0);
});

test('countSolutions stops at the limit', () => {
    const empty = createEmptyGrid(4);
    assert.equal(countSolutions(empty, 2), 2);
    assert.equal(countSolutions(empty, 5), 5);
});

test('an empty 4x4 board has 288 distinct solutions', () => {
    assert.equal(countSolutions(createEmptyGrid(4), Infinity), 288);
});

test('findConflicts reports both sides of a collision and nothing else', () => {
    const grid = createEmptyGrid(4);
    grid[0][0] = 1;
    grid[0][3] = 1; // row conflict with [0][0]
    grid[3][1] = 2; // no conflict

    assert.deepEqual([...findConflicts(grid)].sort(), ['0,0', '0,3']);
});

test('a valid partial grid has no conflicts', () => {
    assert.equal(findConflicts(NINE).size, 0);
    assert.equal(findConflicts(SIX).size, 0);
    assert.equal(findConflicts(FOUR).size, 0);
});
