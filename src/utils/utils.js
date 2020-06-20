export function populateTable(selector, matrix){
    $(selector).children('tbody').children('tr').each((i, el) => {
        $(el).children('td').each((j, child) => {
            $(child).text(matrix[i][j]);
        })
    })
}