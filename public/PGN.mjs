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
        //every move, a fen needs to be stored,
        //it must be pushed when it is white's turn

    }

    find(moveNum, pgnNotation) {
        for (let i = 0; i < this.data.length - 1; i++) {
            for (let j = 0; j < this.data[i].PGNarr.length; j++) {
                if (moveNum === this.data[i].moveCounter) {
                    if (pgnNotation === this.data[i].PGNarr[j]) {
                        console.log('hello');
                        console.log(this.data[i]);
                        return this.data[i].FENarr[j];
                    }
                } else break;

            }

        }

    }

}