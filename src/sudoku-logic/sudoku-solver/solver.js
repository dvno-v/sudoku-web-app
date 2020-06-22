export const fourByFour = [
    [2, 0, 3, 0],
    [0, 0, 1, 2],
    [0, 0, 2, 0],
    [1, 0, 4, 0]
];

export const sixBySix = [
    [5, 0, 0, 0, 3, 4],
    [2, 0, 0, 5, 0, 1],
    [0, 0, 0, 0 ,0 ,0],
    [0, 5, 0, 0, 0, 6],
    [0, 2, 4, 6, 5, 3],
    [0, 0, 0, 1, 0, 0]
];

export const nineByNine = [
    [0,0,0,0,0,0,8,0,0],
    [0,0,4,0,0,8,0,0,9],
    [0,7,0,0,0,0,0,0,5],
    [0,1,0,0,7,5,0,0,8],
    [0,5,6,0,9,1,3,0,0],
    [7,8,0,0,0,0,0,0,0],
    [0,2,0,0,0,0,0,0,0],
    [0,0,0,9,3,0,0,1,0],
    [0,0,5,7,0,0,4,0,3],
]

const UNASSIGNED = 0;

export function solveSudoku(sudokuMatrix){
    const location = [];
    if(!findEmpty(sudokuMatrix, location)){
        return true;
    }

    for (let i = 1; i < 10; i++) {
        if(locationIsGood(sudokuMatrix, location[0], location[1], i)){
            sudokuMatrix[location[0]][location[1]] = i;

            if(solveSudoku(sudokuMatrix)){
                return true;
            }

            sudokuMatrix[location[0]][location[1]] = UNASSIGNED;
        }
    }
    return false;
}

function usedInRow(sudokuMatrix, row, number) {
    for(let i = 0; i < sudokuMatrix[row].length; i++){
        if(sudokuMatrix[row][i] === number) {
            return true;
        }
    }
    return false;
}

function usedInCol(sudokuMatrix, col, number)
{
    for(let i = 0; i < sudokuMatrix.length; i++){
        if(sudokuMatrix[i][col] === number) {
            return true;
        }
    }
    return false;
}

function usedInBox(sudokuMatrix, row, col, number) {
    let boxRowSize, boxColSize, boxRowBeg, boxColBeg;
    switch(sudokuMatrix.length){
        case 9:
            boxColSize = 3;
            boxRowSize = 3;
            break;
        case 6:
            boxColSize = 2;
            boxRowSize = 3;
            break;
        case 4:
            boxColSize = 2;
            boxRowSize = 2;
            break;
    }
    
    boxRowBeg = row - row % boxRowSize;
    boxColBeg = col - col % boxColSize;

    for(let i = 0; i < boxRowSize; i++){
        for (let j = 0; j < boxColSize; j++) {
            if(sudokuMatrix[i + boxRowBeg][j + boxColBeg] === number) {
                return true;
            }
        }
    }
    return false;
}

function locationIsGood(sudokuMatrix, row, col, number) {
    return !usedInBox(sudokuMatrix, row, col, number) && !usedInCol(sudokuMatrix, col, number) && !usedInRow(sudokuMatrix, row, number);
}

function findEmpty(sudokuMatrix, location){
    for (let i = 0; i < sudokuMatrix.length; i++) {
        for (let j = 0; j < sudokuMatrix[i].length; j++) {
            if(sudokuMatrix[i][j] === UNASSIGNED) {
                location[0] = i;
                location[1] = j;
                return true;
            }
        }
    }
    return false;
}
