export const  getSudokuFromApi = async (difficulty = 'easy') => {
    try{
        const res = await fetch(`https://sugoku.herokuapp.com/board?difficulty=${difficulty}`);
        const data = await res.json();
        return data;  
    }
    catch(e) {
        console.error(e);
    }
}