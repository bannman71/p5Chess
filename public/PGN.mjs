export default class PGN {

    constructor(PGNarr, FENarr) {
        this.PGNarr = PGNarr;
        this.FENarr = FENarr;
        this.Data = [{"moveCounter": '', "PGNarr": this.PGNarr, "FENarr": this.FENarr}]
    }

    update(pieceMovedNotation, FEN, moveCounter, whiteToMove) {
        this.PGNarr.push(pieceMovedNotation);
        this.FENarr.push(FEN);
        //every move, a fen needs to be stored,
        //it must be pushed when it is white's turn
        if (whiteToMove) {
            this.Data.push({"moveCounter": '', "PGNarr": [], "FENarr": []})
        }
        this.Data[this.Data.length - 1].moveCounter = moveCounter;
        // this.Data[this.Data.length - 1].PGN
    }

    find(moveNum, pgnNotation) {


    }

}