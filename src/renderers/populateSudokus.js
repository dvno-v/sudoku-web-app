import { nineByNine, sixBySix, fourByFour, solveSudoku } from '../sudoku-solver/solver.js'
import { populateTable } from '../utils/utils.js'

export const populateSudokus = () => {
    populateTable('#nine', nineByNine);
    populateTable('#six', sixBySix);
    populateTable('#four', fourByFour);
};