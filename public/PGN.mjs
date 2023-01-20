export default class PGN {

    constructor(PGNarr, FENarr) {
        this.PGNarr = PGNarr;
        this.FENarr = FENarr;
        this.data = [];
    }

    update(pieceMovedNotation, FEN, moveCounter) {
        this.PGNarr.push(pieceMovedNotation);
        this.FENarr.push(FEN);

        console.log('hey');
        console.log(moveCounter);
        //every move, a fen needs to be stored,
        //it must be pushed when it is white's turn
        this.data.push({"moveCounter": moveCounter, "PGNarr": this.PGNarr, "FENarr": this.FENarr})
        console.log(this.data);

    }

    find(moveNum, pgnNotation) {


    }

}