/**
 * App wiring: owns the current puzzle and translates button clicks and
 * keystrokes into calls on the solver, the generator and the board view.
 */

import { EMPTY, gridsAreEqual, isFull } from './sudoku/grid.js';
import { findConflicts } from './sudoku/solver.js';
import { DIFFICULTIES, generatePuzzle } from './sudoku/generator.js';
import { createBoardView } from './ui/board.js';
import { createToaster } from './ui/toast.js';

const boardElement = document.querySelector('#board');
const statusElement = document.querySelector('#status');
const difficultySelect = document.querySelector('#difficulty');
const sizeButtons = [...document.querySelectorAll('[data-size]')];

const toast = createToaster(document.querySelector('#toasts'));
const board = createBoardView(boardElement, { onChange: handleBoardChange });

const state = {
    size: 9,
    difficulty: 'medium',
    puzzle: null,
    solution: null,
    solved: false,
};

function setStatus(message) {
    statusElement.textContent = message;
}

function newPuzzle() {
    // Generation is a few milliseconds even for a hard 9x9, so it stays inline.
    const { puzzle, solution, clues } = generatePuzzle({ size: state.size, difficulty: state.difficulty });

    state.puzzle = puzzle;
    state.solution = solution;
    state.solved = false;

    board.render(puzzle);
    board.setSolved(false);
    setStatus(`${state.size}x${state.size} · ${state.difficulty} · ${clues} clues`);
    board.focusFirstEmpty();
}

/** Runs on every keystroke: live conflict highlighting and win detection. */
function handleBoardChange() {
    if (state.solved) return;

    const grid = board.getGrid();
    const conflicts = findConflicts(grid);
    board.markConflicts(conflicts);

    if (conflicts.size === 0 && isFull(grid)) {
        state.solved = true;
        board.setSolved(true);
        setStatus('Solved.');
        toast('Solved. Nicely done.', 'success');
    }
}

function checkSolution() {
    const grid = board.getGrid();

    if (!isFull(grid)) {
        // Nothing is "wrong" yet, but anything contradicting the unique
        // solution is worth flagging early.
        const wrong = collectWrongCells(grid);
        board.markWrong(wrong);
        toast(wrong.size ? `${wrong.size} filled cell${wrong.size === 1 ? '' : 's'} can't be right.` : 'So far so good, but the board is not finished.', wrong.size ? 'error' : 'info');
        return;
    }

    if (gridsAreEqual(grid, state.solution)) {
        state.solved = true;
        board.setSolved(true);
        board.clearMarks();
        setStatus('Solved.');
        toast('Correct. Nicely done.', 'success');
        return;
    }

    const wrong = collectWrongCells(grid);
    board.markWrong(wrong);
    toast(`Not quite — ${wrong.size} cell${wrong.size === 1 ? '' : 's'} to fix.`, 'error');
}

/**
 * Filled cells that disagree with the solution. The generator guarantees the
 * puzzle has exactly one solution, so this comparison is safe -- the old
 * version re-solved the puzzle and could reject a legitimate answer.
 */
function collectWrongCells(grid) {
    const wrong = new Set();

    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid.length; col++) {
            if (grid[row][col] !== EMPTY && grid[row][col] !== state.solution[row][col]) {
                wrong.add(`${row},${col}`);
            }
        }
    }

    return wrong;
}

function revealSolution() {
    board.fillEditableCells(state.solution);
    board.clearMarks();
    state.solved = true;
    board.setSolved(true);
    setStatus('Solution revealed.');
    toast('Solution revealed. Start a new puzzle to play again.', 'info');
}

function resetBoard() {
    board.clearUserEntries();
    state.solved = false;
    board.setSolved(false);
    setStatus(`${state.size}x${state.size} · ${state.difficulty} · back to the starting position`);
    board.focusFirstEmpty();
}

function selectSize(size) {
    state.size = size;
    sizeButtons.forEach((button) => {
        const isActive = Number(button.dataset.size) === size;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });
    newPuzzle();
}

sizeButtons.forEach((button) => {
    button.addEventListener('click', () => selectSize(Number(button.dataset.size)));
});

difficultySelect.replaceChildren(
    ...DIFFICULTIES.map((difficulty) => {
        const option = document.createElement('option');
        option.value = difficulty;
        option.textContent = difficulty[0].toUpperCase() + difficulty.slice(1);
        option.selected = difficulty === state.difficulty;
        return option;
    }),
);

difficultySelect.addEventListener('change', (event) => {
    state.difficulty = event.target.value;
    newPuzzle();
});

document.querySelector('#new').addEventListener('click', newPuzzle);
document.querySelector('#check').addEventListener('click', checkSolution);
document.querySelector('#solve').addEventListener('click', revealSolution);
document.querySelector('#reset').addEventListener('click', resetBoard);

selectSize(state.size);
