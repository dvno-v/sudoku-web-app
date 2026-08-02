import test from 'node:test';
import assert from 'node:assert/strict';

import { SUPPORTED_SIZES, boxDimensions, isBoxEdgeBottom, isBoxEdgeRight } from '../src/sudoku/grid.js';

const edgeColumns = (size) => [...Array(size).keys()].filter((col) => isBoxEdgeRight(size, col));
const edgeRows = (size) => [...Array(size).keys()].filter((row) => isBoxEdgeBottom(size, row));

test('9x9 draws box rules after every third row and column', () => {
    assert.deepEqual(edgeColumns(9), [2, 5]);
    assert.deepEqual(edgeRows(9), [2, 5]);
});

// The original stylesheet drew a 6x6 as 3-wide by 2-tall while the solver
// treated it as 3-tall by 2-wide. The drawn boxes must match boxDimensions().
test('6x6 draws 3-wide, 2-tall boxes', () => {
    assert.deepEqual(edgeColumns(6), [2]);
    assert.deepEqual(edgeRows(6), [1, 3]);
});

test('4x4 draws 2x2 boxes', () => {
    assert.deepEqual(edgeColumns(4), [1]);
    assert.deepEqual(edgeRows(4), [1]);
});

test('the outer edge is never given an inner rule', () => {
    for (const size of SUPPORTED_SIZES) {
        assert.ok(!isBoxEdgeRight(size, size - 1), `${size}x${size} should not rule its last column`);
        assert.ok(!isBoxEdgeBottom(size, size - 1), `${size}x${size} should not rule its last row`);
    }
});

test('drawn rules agree with the solver box dimensions', () => {
    for (const size of SUPPORTED_SIZES) {
        const { rows, cols } = boxDimensions(size);
        assert.equal(edgeColumns(size).length, size / cols - 1);
        assert.equal(edgeRows(size).length, size / rows - 1);
    }
});
