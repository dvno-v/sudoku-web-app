import test from 'node:test';
import assert from 'node:assert/strict';

import { EMPTY, SUPPORTED_SIZES, countClues, gridsAreEqual } from '../src/sudoku/grid.js';
import { DIFFICULTIES, clueTarget, generatePuzzle, generateSolution } from '../src/sudoku/generator.js';
import { countSolutions, findConflicts, solvedCopy } from '../src/sudoku/solver.js';
import { assertSolvedGridIsValid, seededRng } from './helpers.js';

for (const size of SUPPORTED_SIZES) {
    test(`generateSolution produces a valid ${size}x${size} grid`, () => {
        assertSolvedGridIsValid(generateSolution(size, seededRng(size)));
    });

    for (const difficulty of DIFFICULTIES) {
        test(`generatePuzzle ${size}x${size} ${difficulty} has exactly one solution`, () => {
            const { puzzle, solution } = generatePuzzle({ size, difficulty, rng: seededRng(size * 31 + difficulty.length) });

            assert.equal(findConflicts(puzzle).size, 0, 'generated puzzle should have no conflicting clues');
            assert.equal(countSolutions(puzzle, 2), 1, 'generated puzzle should be uniquely solvable');
            assertSolvedGridIsValid(solution);
            assert.ok(gridsAreEqual(solvedCopy(puzzle), solution), 'solving the puzzle should reproduce the solution');
        });

        test(`generatePuzzle ${size}x${size} ${difficulty} reaches its clue target`, () => {
            const { puzzle, clues } = generatePuzzle({ size, difficulty, rng: seededRng(7) });
            const target = clueTarget(size, difficulty);

            assert.equal(clues, countClues(puzzle), 'reported clue count should match the puzzle');
            // Digging stops when no further cell can go without losing uniqueness,
            // so allow a little slack above the target but never below it.
            assert.ok(clues >= target, `expected at least ${target} clues, got ${clues}`);
            assert.ok(clues <= target + 6, `expected close to ${target} clues, got ${clues}`);
        });
    }

    test(`generatePuzzle ${size}x${size} clues agree with the solution`, () => {
        const { puzzle, solution } = generatePuzzle({ size, rng: seededRng(size) });

        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (puzzle[row][col] !== EMPTY) {
                    assert.equal(puzzle[row][col], solution[row][col], `clue at ${row},${col} contradicts the solution`);
                }
            }
        }
    });
}

test('harder difficulties give fewer clues', () => {
    const clues = DIFFICULTIES.map((difficulty) => generatePuzzle({ size: 9, difficulty, rng: seededRng(99) }).clues);

    assert.ok(clues[0] > clues[1], `easy (${clues[0]}) should have more clues than medium (${clues[1]})`);
    assert.ok(clues[1] > clues[2], `medium (${clues[1]}) should have more clues than hard (${clues[2]})`);
});

test('successive puzzles differ', () => {
    const first = generatePuzzle({ size: 9 }).puzzle;
    const second = generatePuzzle({ size: 9 }).puzzle;

    assert.ok(!gridsAreEqual(first, second), 'two generated puzzles should not be identical');
});

test('invalid generator input is rejected', () => {
    assert.throws(() => generatePuzzle({ size: 5 }), /Unsupported board size/);
    assert.throws(() => generatePuzzle({ size: 9, difficulty: 'impossible' }), /Unknown difficulty/);
});
