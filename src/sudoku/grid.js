/**
 * Grid primitives shared by the solver, the generator and the UI.
 *
 * A grid is a square array of arrays holding integers 1..size, where EMPTY (0)
 * marks a blank cell. Every board size has its own box shape, which is what
 * makes 6x6 different from the others: its boxes are 2 rows by 3 columns.
 */

export const EMPTY = 0;

const BOX_DIMENSIONS = {
    4: { rows: 2, cols: 2 },
    6: { rows: 2, cols: 3 },
    9: { rows: 3, cols: 3 },
};

export const SUPPORTED_SIZES = Object.keys(BOX_DIMENSIONS).map(Number);

export function boxDimensions(size) {
    const dimensions = BOX_DIMENSIONS[size];
    if (!dimensions) {
        throw new Error(`Unsupported board size: ${size}`);
    }
    return dimensions;
}

export function createEmptyGrid(size) {
    boxDimensions(size);
    return Array.from({ length: size }, () => new Array(size).fill(EMPTY));
}

export function cloneGrid(grid) {
    return grid.map((row) => [...row]);
}

export function gridsAreEqual(a, b) {
    return a.length === b.length && a.every((row, i) => row.length === b[i].length && row.every((value, j) => value === b[i][j]));
}

export function isFull(grid) {
    return grid.every((row) => row.every((value) => value !== EMPTY));
}

export function countClues(grid) {
    return grid.reduce((total, row) => total + row.filter((value) => value !== EMPTY).length, 0);
}

/** Every [row, col] pair of the board, in reading order. */
export function allCells(size) {
    const cells = [];
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            cells.push([row, col]);
        }
    }
    return cells;
}

/** Top-left corner of the box containing the given cell. */
export function boxOrigin(size, row, col) {
    const { rows, cols } = boxDimensions(size);
    return [row - (row % rows), col - (col % cols)];
}

/**
 * Whether a cell sits on an inner box boundary. The UI draws its thick rules
 * from these, and keeping them here means the borders can be tested without a
 * browser -- the old stylesheet hard-coded 3n rules that disagreed with the
 * solver about the shape of a 6x6 box.
 */
export function isBoxEdgeRight(size, col) {
    const { cols } = boxDimensions(size);
    return col % cols === cols - 1 && col !== size - 1;
}

export function isBoxEdgeBottom(size, row) {
    const { rows } = boxDimensions(size);
    return row % rows === rows - 1 && row !== size - 1;
}

/** Fisher-Yates, on a copy, so callers keep their input intact. */
export function shuffle(items, rng = Math.random) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
