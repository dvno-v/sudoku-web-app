import { sixBySix, fourByFour, solveSudoku } from '../sudoku-logic/sudoku-solver/solver.js'
import { getSudokuFromApi } from '../sudoku-logic/sudoku-generator/sudoku-service.js'
import { populateTable } from '../utils/utils.js'

export const populateSudokus = async () => {
    const nineByNine = await getSudokuFromApi()
    populateTable('#nine', nineByNine.board);
    populateTable('#six', sixBySix);
    populateTable('#four', fourByFour);
};