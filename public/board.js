
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

function isOnBoard(Row,Col){ //is used in legal squares so that it doent iterate outside the board
    if (Row >= 0 && Row < 8 && Col >= 0 && Col < 8){
        return true;;
    }
    return false;
}

class Board {

    constructor(FEN){
        this.avPieces = [];
        this.occSquares = create2dArray(8,8);
        
        this.moveCounter = 0;
        this.whiteToMove = true;

        this.blackShortCastlingRights = true;
        this.blackLongCastlingRights = true;
        this.whiteShortCastlingRights = true;
        this.whiteLongCastlingRights = true;

        this.FENToBoard(FEN); // fills up avPieces and occSquares (sus)

        this.inCheck = false;

        this.maskMap = create2dArray(8,8);

        this.pawnMovedTwoSquares = false;
        this.castled = false;
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
       
        switch (piece.type) {
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
                if ((Math.abs(destCol - piece.col)) == 2 && (Math.abs(destRow-piece.row) == 1)){
                    if(piece.isOppositeColour(this.occSquares,destRow, destCol)){
                        this.updatePiecePos(piece,destRow,destCol);
                        return true;
                    }
                }else if ((Math.abs(destRow - piece.row) === 2) && (Math.abs(destCol-piece.col) === 1)) {
                    if(piece.isOppositeColour(this.occSquares,destRow, destCol)){
                        this.updatePiecePos(piece,destRow,destCol);
                        return true;
                    }
                } 
                break;
                
            // case PieceType.king:
            //     return true;
            //     if ((destCol - piece.col) >= 2 && piece.row === destRow){ //if attempts to short castle
            //         if((this.whiteToMove && this.whiteShortCastlingRights) === true){
            //             if (this.checkKingRank(piece,1)){ // checks if there are pieces in the way (dir 1 = right)
            //                 this.shortCastles(piece,destCol); //is a legal castle move
            //                 this.removeCastlingRights(true,true);
            //                 this.castled = true;

            //                 return true;
            //             }
                        
            //         }else if (this.whiteToMove == false && this.blackShortCastlingRights === true){
            //             if (this.checkKingRank(piece,1)){ // checks if there are pieces in the way (dir 1 = right)
            //                 this.shortCastles(piece,destCol); 
            //                 this.removeCastlingRights(true,true);
            //                 this.castled = true;

            //                 return true;
            //             }
            //         }
            //     }  
            //     else if(destCol - piece.col <= -2 && piece.row === destRow){ //if attempts to long castle
            //         if((this.whiteToMove && this.whiteLongCastlingRights) === true ){
            //             if (this.checkKingRank(piece,-1)){
            //                 this.longCastles(piece);
            //                 this.removeCastlingRights(true,true);
            //                 this.castled = true;

            //                 return true;
            //             }
            //         }else if (this.whiteToMove == false && this.blackLongCastlingRights === true){
            //             if (this.checkKingRank(piece,1)){ // checks if there are pieces in the way (dir 1 = right)
            //                 this.longCastles(piece,destCol); 
            //                 this.removeCastlingRights(true,true);
            //                 this.castled = true;

            //                 return true;
            //             }
            //         }
            //     }
            //     else{
            //         if(!(Math.abs(destRow - piece.row) > 1 || Math.abs(destCol - piece.col) > 1) && (piece.isOppositeColour(this.occSquares,destRow,destCol))){
            //             this.removeCastlingRights(true,true);
            //             return true;
            //         }
            //     }
            //     break;
        }

        if (piece.colourAndPiece() == (PieceType.pawn ^ PieceType.white)){    
            if (piece.col === destCol){
                if (piece.row === 6){  // if white pawn on starting square
                    if (piece.row - destRow === 2){ // if moves twice
                        if ((this.occSquares[4][destCol] == PieceType.none) && (this.occSquares[5][destCol] == PieceType.none)){
                            this.pawnMovedTwoSquares = true;
                            return true;
                        }
                    }
                    else if (piece.row - destRow === 1){ // if moves once
                        if (this.occSquares[5][destCol] == PieceType.none){
                            return true;
                        }
                    }
                }        
                else{
                    if (piece.row-destRow == 1){ //if not on starting square
                        if (this.occSquares[destRow][destCol] == PieceType.none){

                            return true;
                        }
                    }
                }
            }else if ((piece.row - destRow === 1) && (piece.col - destCol === 1 || piece.col - destCol === -1)){ //diagonal capture
                if ((this.occSquares[destRow][destCol] !== 0) && (piece.isOppositeColour(this.occSquares,destRow,destCol))){

                    return true;
                }
            }
        }
        else if(piece.colourAndPiece() == (PieceType.pawn ^ PieceType.black)){
            if (piece.col === destCol){
                if (piece.row === 1){  // if black pawn on starting square
                    if (destRow - piece.row === 2){
                        if ((this.occSquares[3][destCol] == PieceType.none) && (this.occSquares[2][destCol] == PieceType.none)){

                            this.pawnMovedTwoSquares = true;
                            return true;
                        }
                    }
                    else if (destRow - piece.row === 1){
                        if ((this.occSquares[2][destCol] == PieceType.none)){

                            return true;
                        }
                    }
                }        
                else{
                    if (destRow - piece.row == 1){
                        if (this.occSquares[destRow][destCol] == PieceType.none){

                            return true;
                        }
                    }
                }
            }
            else if ((destRow - piece.row === 1) && (piece.col - destCol === 1 || piece.col - destCol === -1)){ //diagonal capture
                if ((this.occSquares[destRow][destCol] !== 0 ) && (piece.isOppositeColour(this.occSquares,destRow,destCol))){

                    return true;
                }

            }
        }  
        
    }

    isLegalKingMove(piece,destRow,destCol){
        if ((destCol - piece.col) >= 2 && piece.row === destRow){ //if attempts to short castle
            print('attemtped');
            if((this.whiteToMove && this.whiteShortCastlingRights) === true){
                print('can do it');
                if (this.checkKingRank(piece,1)){ // checks if there are pieces in the way (dir 1 = right)
                    print('can do it');
                    this.shortCastles(piece,destCol); //is a legal castle move
                    this.removeCastlingRights(true,true);
                    this.castled = true;

                    return true;
                }
                
            }else if (this.whiteToMove == false && this.blackShortCastlingRights === true){
                if (this.checkKingRank(piece,1)){ // checks if there are pieces in the way (dir 1 = right)
                    this.shortCastles(piece,destCol); 
                    this.removeCastlingRights(true,true);
                    this.castled = true;

                    return true;
                }
            }
        }  
        else if(destCol - piece.col <= -2 && piece.row === destRow){ //if attempts to long castle
            if((this.whiteToMove && this.whiteLongCastlingRights) === true ){
                if (this.checkKingRank(piece,-1)){
                    this.longCastles(piece);
                    this.removeCastlingRights(true,true);
                    this.castled = true;

                    return true;
                }
            }else if (this.whiteToMove == false && this.blackLongCastlingRights === true){
                if (this.checkKingRank(piece,1)){ // checks if there are pieces in the way (dir 1 = right)
                    this.longCastles(piece,destCol); 
                    this.removeCastlingRights(true,true);
                    this.castled = true;

                    return true;
                }
            }
        }
        else{
            if(!(Math.abs(destRow - piece.row) > 1 || Math.abs(destCol - piece.col) > 1) && (piece.isOppositeColour(this.occSquares,destRow,destCol))){
                this.removeCastlingRights(true,true);
                return true;
            }
        }
        return false;
    }


    updatePiecePos(piece, newRow, newCol){

        if (!(this.occSquares[newRow][newCol] === 0)){ // if a piece has been captured
            for (let i = 0; i < this.avPieces.length; i++){
                //searches for all pieces except itself
                if ((this.avPieces[i].row === newRow && this.avPieces[i].col === newCol) && (this.avPieces[i].colourAndPiece() !== piece.colourAndPiece())){ 
                   
                    if (this.avPieces[i].type === PieceType.rook) { //has to remove castling rights so another rook cant be placed there and castle

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

    shortCastles(king){

        for (let i = 0; i < this.avPieces.length; i++){
            if (this.avPieces[i].row === king.row && this.avPieces[i].col == 7 && this.avPieces[i].colour === king.colour){ // if its a short rook
-
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

    longCastles(king){
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

    legalSquares(piece){ //gets all available squares for piece passed in
        var legalCoords = [];

        for (let options of piece.intervals){
            var col_temp =  piece.col + options.dx;
            var row_temp = piece.row + options.dy;

            while(isOnBoard(row_temp,col_temp)){ //while hasn't gone outside of the array
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

    changeTurn(){ // black -> white || white -> black
        if (this.whiteToMove === true){
            this.whiteToMove = false;
        }else this.whiteToMove = true;
    }

    checkKingRank(king,dir){ //checks if there are pieces on the way of castling
        for (let i = dir; Math.abs(i) <= 4; i += dir){
            if (this.maskMap[king.row][king.col + i] !== 0){ //if piece has been hit


                print(this.maskMap[king.row][king.col + i]);
                if (this.maskMap[king.row][king.col + i] === 1) return false;



                //if piece is same colour rook on the 'h' square
                if ((king.col + i == 7) && this.maskMap[king.row][king.col + i] === king.colour) return true;
                //if piece is same colour rook on 'a' square
                else if((king.col + i == 0) && this.maskMap[king.row][king.col + i] === king.colour) return true;
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

    findMaskSquares(newPosition,piecesToMove){ //gets all available squares that the pieces can move to (excluding captures since they aren't necessary)

        let bitmap = create2dArray(8,8);
        var kingRow,kingCol;
        let oppositeColouredPieces = [];

        if (this.whiteToMove === true){
            for(let i = 0; i < piecesToMove.length; i++){
                if (piecesToMove[i].colour === PieceType.black && (newPosition[piecesToMove[i].row][piecesToMove[i].col] === PieceType.black)){
                    oppositeColouredPieces.push(piecesToMove[i])
                }
                if (piecesToMove[i].colourAndPiece() === (PieceType.king ^ PieceType.white)){
                    kingRow = piecesToMove[i].row;
                    kingCol = piecesToMove[i].col;
                }
            }
        }
        else{
            for(let i = 0; i < piecesToMove.length; i++){
                if ((piecesToMove[i].colour === PieceType.white) && (newPosition[piecesToMove[i].row][piecesToMove[i].col] === PieceType.white)){
                    oppositeColouredPieces.push(piecesToMove[i])
                }
                if (piecesToMove[i].colourAndPiece() === (PieceType.king ^ PieceType.black)){
                    kingRow = piecesToMove[i].row;
                    kingCol = piecesToMove[i].col;
                }
            }
            
        }

        for (var i = 0; i < oppositeColouredPieces.length; i++){

            switch (oppositeColouredPieces[i].type){
                case PieceType.knight: case PieceType.king: case PieceType.pawn:
                   
                    for (let options of oppositeColouredPieces[i].intervals){
                        var col_temp =  oppositeColouredPieces[i].col + options.dx;
                        var row_temp = oppositeColouredPieces[i].row + options.dy;
            
                        if (isOnBoard(row_temp,col_temp)){
                            if (newPosition[row_temp][col_temp] === 0){
                                bitmap[row_temp][col_temp] = 1;
                            }
                        }
                    }
                    break;

                default:
                    for (let options of oppositeColouredPieces[i].intervals){
                        var col_temp =  oppositeColouredPieces[i].col + options.dx;
                        var row_temp = oppositeColouredPieces[i].row + options.dy;
        
                        while(isOnBoard(row_temp,col_temp)){ //while hasn't gone outside of the array
                            if (newPosition[row_temp][col_temp] === 0){
                                bitmap[row_temp][col_temp] = 1;
                            }
                            else{ //if a piece has been hit
                                if (((row_temp === kingRow) && (col_temp === kingCol))) { //if its the king then continue
                                    bitmap[row_temp][col_temp] = 1;
                                }else break; 
                            } 
                            col_temp += options.dx;
                            row_temp += options.dy;
                        }
                    }
                    break;
            }
            
        }

        return bitmap;
    }

    maskBitMap(bitmap){
        this.maskMap = create2dArray(8,8);
  
        for(var i = 0; i < 8; i++){
            for (var j = 0; j < 8; j++){
                if ((bitmap[i][j] === 1)) this.maskMap[i][j] = 1;
                else this.maskMap[i][j] = this.occSquares[i][j];
            }
        }
    }

    checkNextMoveBitmap(piece,piecesToMove, destRow, destCol){
        let tempRow = piece.row;
        let tempCol = piece.col
        let pieceLoc;

        let outOfCheck = true;

        let kingRow,kingCol;

        let bitmap = create2dArray(8,8);
        
        let newPosition = create2dArray(8,8);


        for (let i = 0; i < piecesToMove.length; i++){
            if ((piecesToMove[i].row === piece.row) && (piecesToMove[i].col === piece.col)) { //find the piece
                pieceLoc = i;
            }
            if ((this.whiteToMove) && piecesToMove[i].colourAndPiece() === (PieceType.king ^ PieceType.white)){ //find the king
                kingRow = piecesToMove[i].row;
                kingCol = piecesToMove[i].col;
            }
            else if (!(this.whiteToMove) && piecesToMove[i].colourAndPiece() === (PieceType.king ^ PieceType.black)){
                kingRow = piecesToMove[i].row;
                kingCol = piecesToMove[i].col;
            }
        }

        if ((destRow == kingRow) && (destCol == kingCol)){ //make sure king isnt captured
            return false;
        } 

        piecesToMove[pieceLoc].row = destRow;
        piecesToMove[pieceLoc].col = destCol;



        for (let i = 0; i < piecesToMove.length; i++){ 
            newPosition[piecesToMove[i].row][piecesToMove[i].col] = piecesToMove[i].colour; //create an updated board
            newPosition[destRow][destCol] = piecesToMove[pieceLoc].colour; 
        }


        bitmap = this.findMaskSquares(newPosition,piecesToMove);
        this.maskBitMap(bitmap);


        print(bitmap);
        print(this.maskMap);
        print(newPosition);

        print(this.maskMap[kingRow][kingCol]);



        if (this.maskMap[kingRow][kingCol] === 1) outOfCheck = false; //this is the line that makes it all happen -> disallows pinned pieces and stuff from putting the king in check
        
        print(outOfCheck);

        piecesToMove[pieceLoc].row = tempRow; //move piece back to original square
        piecesToMove[pieceLoc].col = tempCol;

        return outOfCheck;
    }

}
class PieceType{

    static type = {
        'k': 1, 'p' : 2, 'n' : 3, 'b': 4, 'r': 5, 'q': 6,
        'K': 1, 'P' : 2, 'N' : 3, 'B': 4, 'R': 5, 'Q': 6 
    }

    static none = 0;
    static king = 1;
    static pawn = 2;
    static knight = 3;
    static bishop = 4;
    static rook = 5;
    static queen = 6;
    
    static white = 8;
    static black = 16;
}

class Piece {

    constructor(type, row, col, colour,intervals){
        this.type = type;
        this.row = row;
        this.col = col;
        this.colour = colour;   
        this.intervals = intervals;
    }

    colourAndPiece(){
        return this.colour ^ this.type;
    }

    updateSquare(newRow,newCol){
        this.row = newRow;
        this.col = newCol;
    }

    isOppositeColour(occSquares,destRow,destCol){
        return (this.colour & occSquares[destRow][destCol]) === 0;
    }

}
