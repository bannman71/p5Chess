export default class PGN {

    constructor(PGNarr, FENarr, Data) {
        this.PGNarr = PGNarr;
        this.FENarr = FENarr;
        this.Data = Data;
    }

    update(pieceMovedNotation, FEN, moveCounter) {
        this.PGNarr.push(pieceMovedNotation);
        this.FENarr.push(FEN);

        console.log('hey');
        console.log(moveCounter);
        this.Data.push({"moveCounter": moveCounter, "PGNarr": this.PGNarr, "FENarr": this.FENarr});
        //every move, a fen needs to be stored,
        //it must be pushed when it is white's turn

    }

    find(moveNum, pgnNotation) {

        for (let i = 0; i < this.Data.length; i++) {
            for (let j = 0; j < this.PGNarr.length; j++) {
                if (moveNum === this.Data[i].moveCounter) { //if indexed into move to find
                    if (pgnNotation === this.Data[i].PGNarr[j]) {
                        console.log('hello in find');
                        console.log(this.Data[i]);
                        return this.Data[i].FENarr[j];
                    }
                } else break;

            }

        }

    }

}