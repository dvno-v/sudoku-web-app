/**
 * The board view: builds the grid from a puzzle and mediates between the DOM
 * and plain number matrices. Everything above this module works with matrices
 * only, and nothing below it knows what a puzzle means.
 */

import { EMPTY, isBoxEdgeBottom, isBoxEdgeRight } from '../sudoku/grid.js';

const ARROW_OFFSETS = {
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
};

export function createBoardView(root, { onChange = () => {} } = {}) {
    let cells = [];
    let size = 0;

    const cellAt = (row, col) => cells[row]?.[col] ?? null;

    /**
     * Givens are identified by class, not by readOnly: readOnly is also used to
     * lock the whole board once it is solved, and Reset still has to be able to
     * tell a clue apart from a locked user entry.
     */
    const isGiven = (cell) => cell.classList.contains('cell--given');

    const forEachCell = (callback) => {
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                callback(cells[row][col], row, col);
            }
        }
    };

    function buildCell(row, col, value) {
        const input = document.createElement('input');
        input.className = 'cell';
        input.type = 'text';
        input.inputMode = 'numeric';
        input.autocomplete = 'off';
        // Deliberately no maxLength: with one, typing into a filled cell is
        // silently dropped. The input handler keeps the last digit entered
        // instead, so a cell can be overwritten in place.
        input.dataset.row = String(row);
        input.dataset.col = String(col);
        input.setAttribute('aria-label', `Row ${row + 1}, column ${col + 1}`);

        if (value !== EMPTY) {
            input.value = String(value);
            input.readOnly = true;
            input.tabIndex = -1;
            input.classList.add('cell--given');
        }

        // Thick rules on the inner box edges only; the board itself is framed.
        if (isBoxEdgeRight(size, col)) {
            input.classList.add('cell--box-right');
        }
        if (isBoxEdgeBottom(size, row)) {
            input.classList.add('cell--box-bottom');
        }

        return input;
    }

    function render(puzzle) {
        size = puzzle.length;
        root.style.setProperty('--size', String(size));
        root.replaceChildren();
        cells = [];

        for (let row = 0; row < size; row++) {
            const rowCells = [];
            for (let col = 0; col < size; col++) {
                const cell = buildCell(row, col, puzzle[row][col]);
                root.append(cell);
                rowCells.push(cell);
            }
            cells.push(rowCells);
        }
    }

    /** The board as it currently stands, givens and user entries alike. */
    function getGrid() {
        return cells.map((row) => row.map((cell) => Number.parseInt(cell.value, 10) || EMPTY));
    }

    /** Writes values into the editable cells, leaving givens alone. */
    function fillEditableCells(grid) {
        forEachCell((cell, row, col) => {
            if (!isGiven(cell)) {
                const value = grid[row][col];
                cell.value = value === EMPTY ? '' : String(value);
            }
        });
    }

    function clearUserEntries() {
        forEachCell((cell) => {
            if (!isGiven(cell)) {
                cell.value = '';
            }
        });
        clearMarks();
    }

    function clearMarks() {
        forEachCell((cell) => cell.classList.remove('cell--conflict', 'cell--wrong'));
    }

    /** Live feedback: cells that break a sudoku rule right now. */
    function markConflicts(conflicts) {
        forEachCell((cell, row, col) => {
            cell.classList.toggle('cell--conflict', conflicts.has(`${row},${col}`));
        });
    }

    /** Check-time feedback: cells that disagree with the known solution. */
    function markWrong(wrongCells) {
        forEachCell((cell, row, col) => {
            cell.classList.toggle('cell--wrong', wrongCells.has(`${row},${col}`));
        });
    }

    /** Locks the board once there is nothing left to enter. */
    function setSolved(solved) {
        root.classList.toggle('board--solved', solved);
        forEachCell((cell) => {
            if (!isGiven(cell)) {
                cell.readOnly = solved;
            }
            if (solved) {
                cell.blur();
            }
        });
    }

    function focusFirstEmpty() {
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (!cells[row][col].readOnly && !cells[row][col].value) {
                    cells[row][col].focus();
                    return;
                }
            }
        }
    }

    root.addEventListener('input', (event) => {
        const cell = event.target;
        if (!cell.classList.contains('cell')) return;

        // Keep only a single digit in range; anything else never lands.
        const digit = cell.value.replace(/[^1-9]/g, '').slice(-1);
        cell.value = digit && Number(digit) <= size ? digit : '';
        cell.classList.remove('cell--wrong');

        onChange();
    });

    root.addEventListener('focusin', (event) => {
        if (event.target.classList.contains('cell')) {
            event.target.select();
        }
    });

    root.addEventListener('keydown', (event) => {
        const cell = event.target;
        if (!cell.classList.contains('cell')) return;

        const offset = ARROW_OFFSETS[event.key];
        if (offset) {
            event.preventDefault();
            const row = Number(cell.dataset.row);
            const col = Number(cell.dataset.col);
            moveFocus(row, col, offset);
            return;
        }

        // Backspace/Delete on an already-empty cell steps back, like a text field.
        if ((event.key === 'Backspace' || event.key === 'Delete') && !cell.value) {
            event.preventDefault();
            moveFocus(Number(cell.dataset.row), Number(cell.dataset.col), event.key === 'Backspace' ? [0, -1] : [0, 1]);
        }
    });

    /** Steps in the given direction, skipping givens, stopping at the edges. */
    function moveFocus(row, col, [rowStep, colStep]) {
        let nextRow = row + rowStep;
        let nextCol = col + colStep;

        while (nextRow >= 0 && nextRow < size && nextCol >= 0 && nextCol < size) {
            const candidate = cellAt(nextRow, nextCol);
            if (candidate && !candidate.readOnly) {
                candidate.focus();
                candidate.select();
                return;
            }
            nextRow += rowStep;
            nextCol += colStep;
        }
    }

    return {
        render,
        getGrid,
        fillEditableCells,
        clearUserEntries,
        clearMarks,
        markConflicts,
        markWrong,
        setSolved,
        focusFirstEmpty,
    };
}
