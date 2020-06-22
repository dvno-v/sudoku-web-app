import { solveSudoku } from './sudoku-logic/sudoku-solver/solver.js'
import { exportMatrixFromTable, checkIfSudokuIsFull, checkMatricesIfEqual, fillSolvedSudoku, getCopyOfActiveMatrix } from './utils/utils.js'
import { switchToFour } from './renderers/switch-to-four.js'
import { switchToSix } from './renderers/switch-to-six.js'
import { switchToNine } from './renderers/switch-to-nine.js'
import { populateSudokus } from './renderers/populateSudokus.js'

(() => {
    populateSudokus();
    
    $('#switchTo9').click(switchToNine);
    
    $('#switchTo6').click(switchToSix);
    
    $('#switchTo4').click(switchToFour);
    
    $('#reset').click(populateSudokus);

    $('#checkSol').click((e) => {
        if(checkIfSudokuIsFull('.active')){
            const solvedMatrix = getCopyOfActiveMatrix();
            solveSudoku(solvedMatrix);

            const userSolvedMatrix = [];
            exportMatrixFromTable('table.active', userSolvedMatrix);

            checkMatricesIfEqual(solvedMatrix, userSolvedMatrix) ? alert('Good job') :  alert("you suck");
        } else {
            alert('You have not completed the sudoku!')
        }
    });

    $('#solve').click((e) => {
        let matrix = getCopyOfActiveMatrix();
        solveSudoku(matrix);
        fillSolvedSudoku('table.active', matrix);
    });

    toastr.error("a");

})();