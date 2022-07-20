
function create2dArray(rows,cols){
    arr = []
    for(let i = 0; i < cols; i++){
        arr[i] = [];
        for (let j = 0; j < rows; j++){
            arr[i][j] = 0;
        }
    }
    return arr;
}

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
            if (!(/[A-Za-z]/).test(FEN[FENIterator]) && FEN[FENIterator] !== '/'){ // if its a number
                col += FEN[FENIterator].charCodeAt(0) - 49;
            }
    
            if ((/[a-z]/).test(FEN[FENIterator])){ // if lowercase (black piece)
                var newPiece = new Piece(PieceType.type[FEN[FENIterator]],row,col,PieceType.black);
                this.occupiedSquares[row][col] = PieceType.black;
                this.availablePieces.push(newPiece);
            }
            else if ((/[A-Z]/).test(FEN[FENIterator])){ //if uppercase (white piece)
                var newPiece = new Piece(PieceType.type[FEN[FENIterator]],row,col,PieceType.white);
                this.occupiedSquares[row][col] = PieceType.white;
                this.availablePieces.push(newPiece);
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

    isLegal(piece,destRow,destCol){
        var destPos = destRow + '' + destCol;
        const rankFileIntervals = [
            {dx: 1,dy: 0}, 
            {dx: -1,dy: 0}, 
            {dx: 0,dy: 1}, 
            {dx: 0,dy: -1}
        ]
        const diagIntervals = [
            {dx: 1, dy: 1},
            {dx: -1, dy : -1},
            {dx: 1, dy: -1},
            {dx: -1, dy: 1}
        ]

        if (piece.row === destRow && piece.col === destCol){
            return false;
        }

        switch (piece.pieceType) {
            case PieceType.rook:
                return this.legalSquares(piece,rankFileIntervals).includes(destPos);
            case PieceType.queen:
                return this.legalSquares(piece, rankFileIntervals + diagIntervals).includes(destPos);
            case PieceType.bishop:
                return this.legalSquares(piece, diagIntervals).includes(destPos);
            case PieceType.knight:
                if (Math.abs(dCol - sCol) == 2 && Math.abs(dRow-sRow) == 1){
                    return this.isOppositeColour(destRow, destCol);
                }else if ((Math.abs(dRow - sRow) == 2 && Math.abs(dCol-sCol) == 1)) return this.isOppositeColour(destRow, destCol)
                
       }

        return false;
    }

    is_on_board(Row,Col){
        if (Row >= 0 && Row < 8 && Col >= 0 && Col < 8){
            return true;
        }
        return false;
    }

    legalSquares(piece,intervals){
        var legalCoords = [];

        for (let options of intervals){
            var col_temp =  piece.col + options.dx;
            var row_temp = piece.row + options.dy;

            while(this.is_on_board(row_temp,col_temp)){ //while hasn't gone outside of the array
                if (this.occupiedSquares[row_temp][col_temp] === 0){
                    legalCoords.push(row_temp + '' + col_temp);
                }
                else{
                    if ((this.occupiedSquares[row_temp][col_temp] & piece.colour) === 0){ // opposite colours
                        legalCoords.push(row_temp + '' + col_temp);
                    }
                    break;
                } 
                col_temp += options.dx;
                row_temp += options.dy;
            }
        }
        return legalCoords;
    }


    isOppositeColour(piece,destRow,destCol){
        return (piece.colour & occupiedSquares[destRow][destCol]) === 0;
    }

}


class PieceType{

    static type = {
        'k': 1, 'p' : 2, 'n' : 3, 'b': 4, 'r': 5, 'q': 6,
        'K': 1, 'P' : 2, 'N' : 3, 'B': 4, 'R': 5, 'Q': 6 
    }

    static none = 0;
    static king = 1;
    static pawn = 2
    static knight = 3
    static bishop = 4
    static rook = 5
    static queen = 6
    
    static white = 8
    static black = 16
}

class Piece {

    constructor(pieceType, row, col, colour){
        this.pieceType = pieceType;
        this.row = row;
        this.col = col;
        this.colour = colour;   
    }

    colourAndPiece(){
        return this.colour ^ this.pieceType;
    }

  



}