export default class PGN{

    constructor(pgn) {
        this.PGNstr = pgn;
        this.FENarr = () => {
            let arr = []
            for(let i = 0; i < 8; i++){
                arr[i] = [];
                for (let j = 0; j < 8; j++){
                    arr[i][j] = 0;
                }
            }
            return arr;
        };
        this.moveCounter = 0;
    }

    update(start, target){

    }



}