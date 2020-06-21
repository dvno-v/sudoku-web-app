import { nineByNine, sixBySix, fourByFour, solveSudoku } from './sudoku-solver/solver.js'
import { populateTable, exportMatrixFromTable, checkIfSudokuIsFull, checkMatricesIfEqual, fillSolvedSudoku } from './utils/utils.js'
import { switchToFour } from './renderers/switch-to-four.js'
import { switchToSix } from './renderers/switch-to-six.js'
import { switchToNine } from './renderers/switch-to-nine.js'

(() => {

    populateTable('#nine', nineByNine);
    populateTable('#six', sixBySix);
    populateTable('#four', fourByFour);

    $('#switchTo9').click(switchToNine);

    $('#switchTo6').click(switchToSix);

    $('#switchTo4').click(switchToFour);

    $('#checkSol').click((e) => {
        e.preventDefault();
        if(checkIfSudokuIsFull('.active')){
            const resMatrix = [];
            exportMatrixFromTable('.active', resMatrix);
            let isFinished;            
            switch(resMatrix.length){
                case 4:
                    isFinished = checkMatricesIfEqual(resMatrix, fourByFour);
                    break;
                case 6:
                    isFinished = checkMatricesIfEqual(resMatrix, sixBySix);
                    break;
                case 9:
                    isFinished = checkMatricesIfEqual(resMatrix, nineByNine);
                    break;
                default:
                    isFinished = false;
                    break;
            }
            if(isFinished)
                alert('Good job')
            else
                alert("you suck");

        } else {
            alert('You have not completed the sudoku!')
        }
    });

    $('#solve').click((e) => {
        e.preventDefault();
        let matrix;
        switch($('table.active').attr('id')) {
            case 'four':
                matrix = JSON.parse(JSON.stringify(fourByFour));
                break;
            case 'six':
                matrix = JSON.parse(JSON.stringify(sixBySix));
                break;
            case 'nine':
                matrix = JSON.parse(JSON.stringify(nineByNine));
                break;
        }

        solveSudoku(matrix);
        fillSolvedSudoku('table.active', matrix);
    });

    $('#reset').click(() => {
        populateTable('#nine', nineByNine);
        populateTable('#six', sixBySix);
        populateTable('#four', fourByFour);
    })
})();