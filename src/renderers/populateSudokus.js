import { sixBySix, fourByFour, nineByNine, solveSudoku } from '../sudoku-logic/sudoku-solver/solver.js'
import { populateTable } from '../utils/utils.js'

export const populateSudokus = async () => {
    populateTable('#nine', nineByNine);
    populateTable('#six', sixBySix);
    populateTable('#four', fourByFour);
};
