
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
        this.whiteToMove = true;

        this.blackShortCastlingRights = true;
        this.blackLongCastlingRights = true;
        this.whiteShortCastlingRights = true;
        this.whiteLongCastlingRights = true;

        this.inCheck = false;
    }

    FENToBoard(FEN){
        let col = 0;
        let row = 0;
        let FENIterator = 0;
        let finalRank = false;
        let finishedIterating = false;

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
        
        const knightIntervals = [
            {dx: 1, dy: -2},
            {dx: -1, dy: -2},
            {dx: 1, dy: 2},
            {dx: -1, dy: 2},
            {dx: 2, dy: 1},
            {dx: -2, dy: -1},
            {dx: 2, dy: -1},
            {dx: -2, dy: 1},
        ]
        
        const kingIntervals = [
            {dx:1, dy: 0},
            {dx:1, dy: 1},
            {dx:1, dy: -1},
            {dx:0, dy: 1},
            {dx:0, dy: -1},
            {dx:-1, dy: 0},
            {dx:-1, dy: 1},
            {dx:-1, dy: -1},
        ]
        
        while(!finishedIterating){
            if (!(/[A-Za-z]/).test(FEN[FENIterator]) && FEN[FENIterator] !== '/'){ // if its a number
                col += FEN[FENIterator].charCodeAt(0) - 49;
            }
    
            if ((/[a-z]/).test(FEN[FENIterator])){ // if lowercase (black piece)

                switch (FEN[FENIterator]) {
                    case 'b':
                        var newPiece = new Piece(PieceType.type[FEN[FENIterator]],row,col,PieceType.black,diagIntervals);
                        break;
                    case 'r':
                        var newPiece = new Piece(PieceType.type[FEN[FENIterator]],row,col,PieceType.black,rankFileIntervals);
                        break;
                    case 'q':
                        var newPiece = new Piece(PieceType.type[FEN[FENIterator]],row,col,PieceType.black,rankFileIntervals.concat(diagIntervals));
                        break;
                    case 'n':
                        var newPiece = new Piece(PieceType.type[FEN[FENIterator]],row,col,PieceType.black,knightIntervals);
                        break;
                    case 'k': 
                        var newPiece = new Piece(PieceType.type[FEN[FENIterator]],row,col,PieceType.black,kingIntervals);
                        break;
                    case 'p':
                        var newPiece = new Piece(PieceType.type[FEN[FENIterator]],row,col,PieceType.black,[{dx: 1, dy: 1}, {dx: -1, dy: 1}]);
                        break;
                }
            
                this.occSquares[row][col] = PieceType.black;
                this.avPieces.push(newPiece);

            }
            else if ((/[A-Z]/).test(FEN[FENIterator])){ //if uppercase (white piece)
                switch (FEN[FENIterator]) {
                    case 'B':
                        var newPiece = new Piece(PieceType.type[FEN[FENIterator]],row,col,PieceType.white,diagIntervals);
                        break;
                    case 'R':
                        var newPiece = new Piece(PieceType.type[FEN[FENIterator]],row,col,PieceType.white,rankFileIntervals);
                        break;
                    case 'Q':
                        var newPiece = new Piece(PieceType.type[FEN[FENIterator]],row,col,PieceType.white,rankFileIntervals.concat(diagIntervals));
                        break;
                    case 'N':
                        var newPiece = new Piece(PieceType.type[FEN[FENIterator]],row,col,PieceType.white,knightIntervals);
                        break;
                    case 'K': 
                        var newPiece = new Piece(PieceType.type[FEN[FENIterator]],row,col,PieceType.white,kingIntervals);
                        break;
                    case 'P':
                        var newPiece = new Piece(PieceType.type[FEN[FENIterator]],row,col,PieceType.white,[{dx: 1, dy: -1}, {dx: -1, dy: -1}]);
                        break;
                }
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

    isLegalMove(piece,destRow,destCol){
        var destPos = destRow + '' + destCol;
        

        if (this.whiteToMove === true && piece.colour === PieceType.black) return false;
        if (this.whiteToMove === false && piece.colour === PieceType.white) return false;

        if (piece.row === destRow && piece.col === destCol){
            return false;
        }

        switch (piece.pieceType) {
            case PieceType.rook:
                if (this.legalSquares(piece).includes(destPos)){
                    if (piece.col === 7) this.removeCastlingRights(true, false);
                    else if (piece.col === 0) this.removeCastlingRights(false, true)
                    return true;
                }
                break;
            case PieceType.queen:
                if (this.legalSquares(piece).includes(destPos)){
                    return true;
                }
                break;
            case PieceType.bishop:
                if (this.legalSquares(piece).includes(destPos)){
                    return true;
                }
                break;
            case PieceType.knight:
                if (this.knightLegalSquares(piece).includes(destPos)){
                    return true;
                }
                break;
            case PieceType.king:
                if ((destCol - piece.col) >= 2 && piece.row === destRow){ //if attempts to short castle
                    if((this.whiteToMove && this.whiteShortCastlingRights) === true){
                        if (this.checkKingRank(piece,1)){ // checks if there are pieces in the way (dir 1 = right)
                            this.castles(piece,destCol); //is a legal castle move
                            this.removeCastlingRights(true,true);
                          
                            return true;
                        }
                        
                    }else if (this.whiteToMove == false && this.blackShortCastlingRights === true){
                        if (this.checkKingRank(piece,1)){ // checks if there are pieces in the way (dir 1 = right)
                            this.castles(piece,destCol); 
                            this.removeCastlingRights(true,true);
                          
                            return true;
                        }
                    }
                }  
                else if(destCol - piece.col <= -2 && piece.row === destRow){ //if attempts to long castle
                    if((this.whiteToMove && this.whiteLongCastlingRights) === true ){
                        if (this.checkKingRank(piece,-1)){
                            this.castles(piece,destCol);
                            this.removeCastlingRights(true,true);
                            
                            return true;
                        }
                    }else if (this.whiteToMove == false && this.blackLongCastlingRights === true){
                        if (this.checkKingRank(piece,1)){ // checks if there are pieces in the way (dir 1 = right)
                            this.castles(piece,destCol); 
                            this.removeCastlingRights(true,true);
                
                            return true;
                        }
                    }
                }
                else{
                    if(!(Math.abs(destRow - piece.row) > 1 && Math.abs(destCol - piece.col) > 1) && (piece.isOppositeColour(this.occSquares,destRow,destCol))){
                        this.removeCastlingRights(true,true);
                        return true;
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
                            return true;
                        }
                    }
                    else if (piece.row - destRow === 1){ // if moves once
                        if (this.occSquares[5][destCol] == PieceType.none){
                            this.updatePiecePos(piece,destRow,destCol);
                            return true;
                        }
                    }
                }        
                else{
                    if (piece.row-destRow == 1){ //if not on starting square
                        if (this.occSquares[destRow][destCol] == PieceType.none){
                            this.updatePiecePos(piece,destRow,destCol);
                            return true;
                        }
                    }
                }
            }else if ((piece.row - destRow === 1) && (piece.col - destCol === 1 || piece.col - destCol === -1)){ //diagonal capture
                if ((this.occSquares[destRow][destCol] !== 0) && (piece.isOppositeColour(this.occSquares,destRow,destCol))){
                    this.updatePiecePos(piece,destRow,destCol);
                    return true;
                }
            }
        }
        else if(piece.colourAndPiece() == (PieceType.pawn ^ PieceType.black)){
            if (piece.col === destCol){
                if (piece.row === 1){  // if black pawn on starting square
                    if (destRow - piece.row === 2){
                        if ((this.occSquares[3][destCol] == PieceType.none) && (this.occSquares[2][destCol] == PieceType.none)){
                            this.updatePiecePos(piece,destRow,destCol);
                            return true;
                        }
                    }
                    else if (destRow - piece.row === 1){
                        if ((this.occSquares[2][destCol] == PieceType.none)){
                            this.updatePiecePos(piece,destRow,destCol);
                            return true;
                        }
                    }
                }        
                else{
                    if (destRow - piece.row == 1){
                        if (this.occSquares[destRow][destCol] == PieceType.none){
                            this.updatePiecePos(piece,destRow,destCol);
                            return true;
                        }
                    }
                }
            }
            else if ((destRow - piece.row === 1) && (piece.col - destCol === 1 || piece.col - destCol === -1)){ //diagonal capture
                if ((this.occSquares[destRow][destCol] !== 0 ) && (piece.isOppositeColour(this.occSquares,destRow,destCol))){
                    this.updatePiecePos(piece,destRow,destCol);
                    return true;
                }

            }
        }  
        
    }

    updatePiecePos(piece, newRow, newCol){

        if (!(this.occSquares[newRow][newCol] === 0)){ // if a piece has been captured
            for (let i = 0; i < this.avPieces.length; i++){
                //searches for all pieces except itself
                if ((this.avPieces[i].row === newRow && this.avPieces[i].col === newCol) && (this.avPieces[i].colourAndPiece() !== piece.colourAndPiece())){ 
                   
                    if (this.avPieces[i].pieceType === PieceType.rook) { //has to remove castling rights so another rook cant be placed there and castle

                        //scuffed but faster
                        this.avPieces.splice(i,1); 
                        
                        this.occSquares[piece.row][piece.col] = 0; 
                        this.occSquares[newRow][newCol] = piece.colour;

                        this.checkRookCapture();
                        piece.updateSquare(newRow,newCol);
                        return;
                    }

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

    isOnBoard(Row,Col){ //is used in legal squares so that it doent iterate outside the board
        if (Row >= 0 && Row < 8 && Col >= 0 && Col < 8){
            return true;;
        }
        return false;
    }

    legalSquares(piece){ //gets all available squares for piece passed in
        var legalCoords = [];

        for (let options of piece.intervals){
            var col_temp =  piece.col + options.dx;
            var row_temp = piece.row + options.dy;

            while(this.isOnBoard(row_temp,col_temp)){ //while hasn't gone outside of the array
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

    knightLegalSquares(piece){
        var legalCoords = [];

        for (let options of piece.intervals){
            var col_temp =  piece.col + options.dx;
            var row_temp = piece.row + options.dy;

            if (this.isOnBoard(row_temp,col_temp)){
                if (this.occSquares[row_temp][col_temp] === 0){
                    legalCoords.push(row_temp + '' + col_temp);
                }
                else{
                    print('hello')
                    if ((this.occSquares[row_temp][col_temp] & piece.colour) === 0){ // opposite colours
                        legalCoords.push(row_temp + '' + col_temp);
                    }
                    break;
                } 
            }
        }
        
        return legalCoords;
    }

    pawnDiagonals(piece){ //is used in bitmap so king cant walk into pawn check
        var coords = [];

        if (piece.colour === PieceType.black){
            coords.push((piece.row + 1) + '' + (piece.col + 1));
            coords.push((piece.row + 1) + '' + (piece.col - 1));
            return coords;
        }
        
        coords.push((piece.row - 1) + '' + (piece.col + 1));
        coords.push((piece.row - 1) + '' + (piece.col - 1));
        return coords;
    }

    changeTurn(){ // black -> white || white -> black
        if (this.whiteToMove === true){
            this.whiteToMove = false;
        }else this.whiteToMove = true;
    }

    checkKingRank(king,dir){ //checks if there are pieces on the way of castling
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

    checkRookCapture(){ //if a rook is captured castling rights need to be taken away
        if (this.occSquares[0][0] !== 16)this.blackLongCastlingRights = false; //black 'a' rook
        else if (this.occSquares[0][7] !== 16) this.blackShortCastlingRights = false; //black 'h' rook
        else if (this.occSquares[7][0] !== 8) this.whiteLongCastlingRights = false; //white 'a' rook
        else if(this.occSquares[7][7] !== 8) this.whiteShortCastlingRights = false; //white 'h' rook
    }

    //make a move and check if its legal 
    //generate an array of where all pieces attack in this new position
    //if the king is in an attacked square (represented as 1) they are in check -> therefore disallow that move

    maskSquares(){ //gets all available squares for piece passed in
        var bitmap = this.occSquares;
        let kingRow,kingCol;
        let oppositeColouredPieces = [];

        for (var i = 0; i < this.avPieces.length; i++){
            if (this.avPieces[i].pieceType === PieceType.king){ //store coords of king
                kingRow = this.avPieces[i].row;
                kingCol = this.avPieces[i].col;
                break;
            }
        }

        if (this.whiteToMove === true){
            for(var i = 0; i < this.avPieces.length; i++){
                if (this.avPieces[i].colour === PieceType.black){
                    oppositeColouredPieces.push(this.avPieces[i])
                }
            }
        }
        else{
            for(var i = 0; i < this.avPieces.length; i++){
                if (this.avPieces[i].colour === PieceType.white){
                    oppositeColouredPieces.push(this.avPieces[i])
                }
            }
        }

        //when its blacks turn you need the bitmap generated from where white pieces attack
        //maybe make an array of all white pieces on the board then do stuff with that


        //when finding legal king moves
        //you need where all the opposite coloured pieces are attacking


        for (var i = 0; i < oppositeColouredPieces.length; i++){

            //if ()

            for (let options of intervals){
                var col_temp =  oppositeColouredPieces[i].col + options.dx;
                var row_temp = oppositeColouredPieces[i].row + options.dy;

                while(this.isOnBoard(row_temp,col_temp)){ //while hasn't gone outside of the array
                    if (this.occSquares[row_temp][col_temp] === 0){
                        bitmap[row_temp][col_temp] = 1;
                    }
                    else{ //if a piece has been hit
                        let kingHit = false;
                    

                        if ((this.occSquares[row_temp][col_temp] & oppositeColouredPieces[i].colour) === 0){ // opposite colours
                            bitmap[row_temp][col_temp] = 1;
                        }
                        if (!kingHit) break; //if 
                    } 
                    col_temp += options.dx;
                    row_temp += options.dy;
                }
            }
        }
        return bitmap;
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

    constructor(pieceType, row, col, colour,intervals){
        this.pieceType = pieceType;
        this.row = row;
        this.col = col;
        this.colour = colour;   
        this.intervals = intervals;
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