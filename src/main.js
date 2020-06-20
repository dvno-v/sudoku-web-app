import { nineByNine, sixBySix, fourByFour, solveSudoku } from './sudoku-solver/solver.js'
import { populateTable } from './utils/utils.js'

(() => {
    populateTable('#nine', nineByNine);
    populateTable('#six', sixBySix);
    populateTable('#four', fourByFour);

    $('#switchTo9').click(() => {
        $('#nine').fadeIn();
        $('#six').css('display', "none");
        $('#four').css('display', "none");
    });

    $('#switchTo6').click(() => {
        $('#nine').css('display', "none");
        $('#six').fadeIn();
        $('#four').css('display', "none");
    });

    $('#switchTo4').click(() => {
        $('#nine').css('display', "none");
        $('#six').css('display', "none");
        $('#four').fadeIn();
    });
})()