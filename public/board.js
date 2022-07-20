class Board {

    constructor(FEN){
        this.availablePieces = [];
        this.occupiedSquares = create2dArray(8,8);
        this.FENToBoard(FEN);
    }


    FENToBoard(FEN){
        let col = 0;
        let row = 0;
        let FENIterator = 0;
        let finalRank = false;
        let finishedIterating = false;
    
        while(!finishedIterating){
            if(!(/[A-Za-z]/).test(FEN[FENIterator]) && FEN[FENIterator] !== '/'){ // if its a number
                col += FEN[FENIterator].charCodeAt(0) - 49;
            }
    
            if((/[a-z]/).test(FEN[FENIterator])){ // if lowercase (black piece)
                var newPiece = new Piece(PieceType.type[FEN[FENIterator]],row,col,PieceType.black);
                this.occupiedSquares[row][col] = PieceType.black;
                this.pieces.push(newPiece);
            }
            else if ((/[A-Z]/).test(FEN[FENIterator])){ //if uppercase (white piece)
                var newPiece = new Piece(PieceType.type[FEN[FENIterator]],row,col,PieceType.white);
                this.occupiedSquares[row][col] = PieceType.white;
                this.pieces.push(newPiece);
            }
    
            if (col == 8){
                row += 1;
                col = 0;
            }else col += 1;
    
            if (finalRank && col == 8){
                finishedIterating = true;
            }
            if (row == 7) finalRank = true;
            FENIterator++;
        }

    }
}