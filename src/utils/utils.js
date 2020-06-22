import { nineByNine, sixBySix, fourByFour } from '../sudoku-logic/sudoku-solver/solver.js'

export function populateTable(selector, matrix){
    $(selector).children('tbody').children('tr').each((i, el) => {
        $(el).children('td').each((j, child) => {
            // $(child).text(matrix[i][j]);
            $(child).text("");
            $(child).append($(`<input size="2" autocomplete="off" type="number" ${matrix[i][j] ? `readonly class="readonly" value="${matrix[i][j]}"` : ``} id="${selector} ${i} ${j}">`))
        })
    })
}


export function checkMatricesIfEqual(matrix1, matrix2) {

	// Matrices are expected to be square, and that's why i only check matrix1[0].length and matrix2[0] 

	if(matrix1.length !== matrix2.length || matrix1[0].length !== matrix2[0].length) 
		return false;

	for(let i = 0; i < matrix1.length; i++) {
		for (let j = 0; j < matrix1[0].length; j++) {
			if(matrix1[i][j] !== matrix2[i][j])
				return false;
		}
	}

	return true;
}

export function exportMatrixFromTable(selector, resultMatrix) {
    $(selector).children('tbody').children('tr').each((i, el) => {
    	resultMatrix.push([]);
        $(el).children('td').each((j, child) => {
        	let curr = $(child).children('input').val();
            resultMatrix[i].push(parseInt(curr ? curr : 0 ));
        })
    })
}

export function checkIfSudokuIsFull(selector) {
	let full = true; 
    $(selector).children('tbody').children('tr').each((i, el) => {
        $(el).children('td').each((j, child) => {
            if(!$(child).children('input').val()){
            	full = false;
            }
        })
    })
    return full;
}

export function fillSolvedSudoku(selector, solvedMatrix) {
	    $(selector).children('tbody').children('tr').each((i, el) => {
        $(el).children('td').each((j, child) => {
            $(child).children('input').attr('value', solvedMatrix[i][j]);
        })
    })
}

function makeCopyOfMatrix(matrix) {
    return JSON.parse(JSON.stringify(matrix));
}

export function getCopyOfActiveMatrix() {
    let matrix;
    switch($('table.active').attr('id')) {
        case 'four':
            matrix = makeCopyOfMatrix(fourByFour);
            break;
        case 'six':
            matrix = makeCopyOfMatrix(sixBySix);
            break;
        case 'nine':
            matrix = makeCopyOfMatrix(nineByNine);
            break;
    }
    return matrix;
}