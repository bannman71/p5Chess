export default class PGN{

    constructor() {
        this.PGNarr = [];
        this.FENarr = [];
    }

    update(pieceMovedNotation, target, FEN){
         this.PGNarr.push(pieceMovedNotation);
         this.FENarr.push(FEN);
    }


    //for i length arr
    //  div &=

}