import assert from 'node:assert/strict';

import { boxDimensions, isFull } from '../src/sudoku/grid.js';

/**
 * Asserts that every row, column and box of a completed grid holds each value
 * 1..size exactly once. Deliberately independent of the solver so a bug in the
 * solver cannot make its own output look correct.
 */
export function assertSolvedGridIsValid(grid) {
    const size = grid.length;
    const { rows: boxRows, cols: boxCols } = boxDimensions(size);
    const expected = Array.from({ length: size }, (_, i) => i + 1);

    assert.ok(isFull(grid), 'grid should have no empty cells');

    for (let i = 0; i < size; i++) {
        const row = [...grid[i]].sort((a, b) => a - b);
        assert.deepEqual(row, expected, `row ${i} is not a permutation of 1..${size}`);

        const col = grid.map((r) => r[i]).sort((a, b) => a - b);
        assert.deepEqual(col, expected, `column ${i} is not a permutation of 1..${size}`);
    }

    for (let boxRow = 0; boxRow < size; boxRow += boxRows) {
        for (let boxCol = 0; boxCol < size; boxCol += boxCols) {
            const box = [];
            for (let r = boxRow; r < boxRow + boxRows; r++) {
                for (let c = boxCol; c < boxCol + boxCols; c++) {
                    box.push(grid[r][c]);
                }
            }
            box.sort((a, b) => a - b);
            assert.deepEqual(box, expected, `box at ${boxRow},${boxCol} is not a permutation of 1..${size}`);
        }
    }
}

/**
 * Deterministic stand-in for Math.random (mulberry32), so generator tests fail
 * reproducibly rather than once every few hundred runs.
 */
export function seededRng(seed = 1) {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
