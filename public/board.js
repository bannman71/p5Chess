
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
        this.avPieces = [];
        this.occSquares = create2dArray(8,8);
        this.FENToBoard(FEN); // fills up avPieces and occSquares (sus)
        this.moveCounter = 0;
        this.whiteToMove = false;

        this.blackShortCastlingRights = true;
        this.blackLongCastlingRights = true;
        this.whiteShortCastlingRights = true;
        this.whiteLongCastlingRights = true;
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
                this.occSquares[row][col] = PieceType.black;
                this.avPieces.push(newPiece);
            }
            else if ((/[A-Z]/).test(FEN[FENIterator])){ //if uppercase (white piece)
                var newPiece = new Piece(PieceType.type[FEN[FENIterator]],row,col,PieceType.white);
                this.occSquares[row][col] = PieceType.white;
                this.avPieces.push(newPiece);
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

    makeLegalMove(piece,destRow,destCol){
        var destPos = destRow + '' + destCol;
        let legalMove = false;

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

        if (this.whiteToMove === true && piece.colour === PieceType.black) return false;
        if (this.whiteToMove === false && piece.colour === PieceType.white) return false;

        if (piece.row === destRow && piece.col === destCol){
            return false;
        }

        /* || (this.whiteToMove === false && this.bCastlingRights)*/
   

        switch (piece.pieceType) {
            case PieceType.rook:
                if (this.legalSquares(piece,rankFileIntervals).includes(destPos)){
                    if (piece.col === 7) this.removeCastlingRights(true, false);
                    else if (piece.col === 0) this.removeCastlingRights(false, true)

                    this.updatePiecePos(piece,destRow,destCol);

                    legalMove = true;
                }
                break;
            case PieceType.queen:
                if (this.legalSquares(piece, rankFileIntervals.concat(diagIntervals)).includes(destPos)){
                    this.updatePiecePos(piece,destRow,destCol);
                    legalMove = true;
                }
                break;
            case PieceType.bishop:
                if (this.legalSquares(piece, diagIntervals).includes(destPos)){
                    this.updatePiecePos(piece,destRow,destCol);
                    legalMove = true;
                }
                break;
            case PieceType.knight:
                print(Math.abs(destCol - piece.col));
                print(Math.abs(destRow-piece.row));
                if ((Math.abs(destCol - piece.col)) == 2 && (Math.abs(destRow-piece.row) == 1)){
                    if(piece.isOppositeColour(this.occSquares,destRow, destCol)){
                        this.updatePiecePos(piece,destRow,destCol);
                        legalMove = true;
                    }
                }else if ((Math.abs(destRow - piece.row) === 2) && (Math.abs(destCol-piece.col) === 1)) {
                    if(piece.isOppositeColour(this.occSquares,destRow, destCol)){
                        this.updatePiecePos(piece,destRow,destCol);
                        legalMove = true;
                    }
                } 
                break;
            case PieceType.king:
                if ((destCol - piece.col) >= 2 && piece.row === destRow){ //if attempts to short castle
                    if((this.whiteToMove && this.whiteShortCastlingRights) === true){
                        if (this.checkKingRank(piece,1)){ // checks if there are pieces in the way (dir 1 = right)
                            this.castles(piece,destCol); //is a legal castle move
                            this.removeCastlingRights(true,true);
                          
                            legalMove = true;
                        }
                        
                    }else if (this.whiteToMove == false && this.blackShortCastlingRights === true){
                        print('in there');
                        if (this.checkKingRank(piece,1)){ // checks if there are pieces in the way (dir 1 = right)
                            this.castles(piece,destCol); //is a legal castle move
                            this.removeCastlingRights(true,true);
                          
                            legalMove = true;
                        }
                    }
                }  
                else if(destCol - piece.col <= -2 && piece.row === destRow){ //if attempts to long castle
                    print('left');
                    if((this.whiteToMove && this.whiteLongCastlingRights) === true ){
                        if (this.checkKingRank(piece,-1)){
                            this.castles(piece,destCol);
                            this.removeCastlingRights(true,true);
                            
                            legalMove = true
                        }
                    }else if (this.whiteToMove == false && this.blackLongCastlingRights === true){
                        if (this.checkKingRank(piece,1)){ // checks if there are pieces in the way (dir 1 = right)
                            this.castles(piece,destCol); //is a legal castle move
                            this.removeCastlingRights(true,true);
                          
                            legalMove = true;
                        }
                    }
                }
                else{
                    if(!(Math.abs(destRow - piece.row) > 1 && Math.abs(destCol - piece.col) > 1) && (piece.isOppositeColour(this.occSquares,destRow,destCol))){
                        this.removeCastlingRights(true,true);
                        this.updatePiecePos(piece,destRow,destCol);
                        legalMove = true;
                    }
                }
                break;
            
        }

        if (piece.colourAndPiece() == (PieceType.pawn ^ PieceType.white)){    
            if (piece.col === destCol){
                if (piece.row === 6){  // if white pawn on starting square
                    if (piece.row - destRow === 2){ // if moves twice
                        if ((this.occSquares[4][destCol] == PieceType.none) && (this.occSquares[5][destCol] == PieceType.none)){
                            this.updatePiecePos(piece,destRow,destCol);
                            legalMove = true;
                        }
                    }
                    else if (piece.row - destRow === 1){ // if moves once
                        if (this.occSquares[5][destCol] == PieceType.none){
                            this.updatePiecePos(piece,destRow,destCol);
                            legalMove = true;
                        }
                    }
                }        
                else{
                    if (piece.row-destRow == 1){ //if not on starting square
                        if (this.occSquares[destRow][destCol] == PieceType.none){
                            this.updatePiecePos(piece,destRow,destCol);
                            legalMove = true;
                        }
                    }
                }
            }else if ((piece.row - destRow === 1) && (piece.col - destCol === 1 || piece.col - destCol === -1)){ //diagonal capture
                if ((this.occSquares[destRow][destCol] !== 0) && (piece.isOppositeColour(this.occSquares,destRow,destCol))){
                    this.updatePiecePos(piece,destRow,destCol);
                    legalMove = true;
                }
            }
        }
        else if(piece.colourAndPiece() == (PieceType.pawn ^ PieceType.black)){
            if (piece.col === destCol){
                if (piece.row === 1){  // if black pawn on starting square
                    if (destRow - piece.row === 2){
                        if ((this.occSquares[3][destCol] == PieceType.none) && (this.occSquares[2][destCol] == PieceType.none)){
                            this.updatePiecePos(piece,destRow,destCol);
                            legalMove = true;
                        }
                    }
                    else if (destRow - piece.row === 1){
                        if ((this.occSquares[2][destCol] == PieceType.none)){
                            this.updatePiecePos(piece,destRow,destCol);
                            legalMove = true;
                        }
                    }
                }        
                else{
                    if (destRow - piece.row == 1){
                        if (this.occSquares[destRow][destCol] == PieceType.none){
                            this.updatePiecePos(piece,destRow,destCol);
                            legalMove = true;
                        }
                    }
                }
            }
            else if ((destRow - piece.row === 1) && (piece.col - destCol === 1 || piece.col - destCol === -1)){ //diagonal capture
                if ((this.occSquares[destRow][destCol] !== 0 ) && (piece.isOppositeColour(this.occSquares,destRow,destCol))){
                    this.updatePiecePos(piece,destRow,destCol);
                    legalMove = true;
                }

            }
        }
        
        
        if (legalMove && (piece.colour === PieceType.black)) this.moveCounter++;
    
    }

    updatePiecePos(piece, newRow, newCol){

        if (!(this.occSquares[newRow][newCol] === 0)){
            for (let i = 0; i < this.avPieces.length; i++){
                //searches for all pieces except itself
                if ((this.avPieces[i].row === newRow && this.avPieces[i].col === newCol) && this.avPieces[i].colourAndPiece() !== piece.colourAndPiece()){ 
                    this.avPieces.splice(i,1); //gets rid of the piece (captures it)
                    break;
                }
            }
        }

        this.occSquares[piece.row][piece.col] = 0;
        this.occSquares[newRow][newCol] = piece.colour;
        piece.updateSquare(newRow,newCol);
    }

    castles(king,newCol){

        if (newCol - king.col >= 2){ 
            for (let i = 0; i < this.avPieces.length; i++){
                if (this.avPieces[i].row === king.row && this.avPieces[i].col == 7 && this.avPieces[i].colour === king.colour){ // if its a short rook

                    this.avPieces[i].updateSquare(this.avPieces[i].row, 5); //change rooks position

                    this.occSquares[this.avPieces[i].row][7] = 0; 
                    this.occSquares[this.avPieces[i].row][5] = this.avPieces[i].colour;

                    this.occSquares[king.row][4] = 0;
                    this.occSquares[king.row][6] = king.colour;

                    break;
                }
            }
            king.updateSquare(king.row, 6);
        }
        else if(newCol - king.col <= -2 ){
            for (let i = 0; i < this.avPieces.length; i++){
                if (this.avPieces[i].row == king.row && this.avPieces[i].col == 0 && this.avPieces[i].colour === king.colour){ // if its a long rook

                    this.avPieces[i].updateSquare(this.avPieces[i].row, 3); //change rooks position

                    this.occSquares[this.avPieces[i].row][0] = 0;
                    this.occSquares[this.avPieces[i].row][2] = this.avPieces[i].colour;

                    this.occSquares[king.row][4] = 0;
                    this.occSquares[king.row][2] = king.colour;

                    break;
                }
            }
            king.updateSquare(king.row, 2);
        }
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
                if (this.occSquares[row_temp][col_temp] === 0){
                    legalCoords.push(row_temp + '' + col_temp);
                }
                else{
                    if ((this.occSquares[row_temp][col_temp] & piece.colour) === 0){ // opposite colours
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

    changeTurn(){
        if (this.whiteToMove === true){
            this.whiteToMove = false;
        }else this.whiteToMove = true;
    }

    checkKingRank(king,dir){
        for (let i = dir; Math.abs(i) <= 4; i += dir){
            if (this.occSquares[king.row][king.col + i] !== 0){ //if piece has been hit
                //if piece is same colour rook on the 'h' square
                if ((king.col + i == 7) && this.occSquares[king.row][king.col + i] === king.colour) return true; 
                //if piece is same colour rook on 'a' square
                else if((king.col + i == 0) && this.occSquares[king.row][king.col + i] === king.colour) return true;
            }
        }
        return false;
    }

    removeCastlingRights(short,long){
        if (this.whiteToMove){
            if (short) this.whiteShortCastlingRights = false;
            if (long) this.whiteLongCastlingRights = false;
        } 
        else{
            if (short) this.blackShortCastlingRights = false; 
            if (long) this.blackLongCastlingRights = false;
        }
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

    updateSquare(newRow,newCol){
        this.row = newRow;
        this.col = newCol;
    }

    isOppositeColour(occSquares,destRow,destCol){
        return (this.colour & occSquares[destRow][destCol]) === 0;
    }

}