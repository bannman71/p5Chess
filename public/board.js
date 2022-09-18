
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

        this.maskMap = create2dArray(8,8);

        this.pawnMovedTwoSquares = false;
        this.pawnMovedTwoSquaresCol = 0;
        this.enPassentTaken = false;

        this.isInCheck = false;

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
                        this.occSquares[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.black, diagIntervals);
                        //var newPiece = new Piece(PieceType.type[FEN[FENIterator]],row,col,PieceType.black,diagIntervals);
                        break;
                    case 'r':
                        this.occSquares[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.black, rankFileIntervals);
                        //var newPiece = new Piece(PieceType.type[FEN[FENIterator]],row,col,PieceType.black,rankFileIntervals);
                        break;
                    case 'q':
                        this.occSquares[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.black, rankFileIntervals.concat(diagIntervals));
                        //var newPiece = new Piece(PieceType.type[FEN[FENIterator]],row,col,PieceType.black,rankFileIntervals.concat(diagIntervals));
                        break;
                    case 'n':
                        this.occSquares[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.black, knightIntervals);
                        //var newPiece = new Piece(PieceType.type[FEN[FENIterator]],row,col,PieceType.black,knightIntervals);
                        break;
                    case 'k': 
                        this.occSquares[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.black, kingIntervals);
                        //var newPiece = new Piece(PieceType.type[FEN[FENIterator]],row,col,PieceType.black,kingIntervals);
                        break;
                    case 'p':
                        this.occSquares[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.black, [{dx: 1, dy: 1}, {dx: -1, dy: 1}]);
                        var newPiece = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.black, [{dx: 1, dy: 1}, {dx: -1, dy: 1}]);
                        break;
                }
            
                // this.occSquares[row][col] = PieceType.black;
                // this.avPieces.push(newPiece);

            }
            else if ((/[A-Z]/).test(FEN[FENIterator])){ //if uppercase (white piece)
                switch (FEN[FENIterator]) {
                    case 'B':
                        this.occSquares[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.white, diagIntervals);
                        break;
                    case 'R':
                        this.occSquares[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.white, rankFileIntervals);
                        //var newPiece = new Piece(PieceType.type[FEN[FENIterator]],row,col,PieceType.white,rankFileIntervals);
                        break;
                    case 'Q':
                        this.occSquares[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.white, rankFileIntervals.concat(diagIntervals));
                        //var newPiece = new Piece(PieceType.type[FEN[FENIterator]],row,col,PieceType.white,rankFileIntervals.concat(diagIntervals));
                        break;
                    case 'N':
                        this.occSquares[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.white, knightIntervals);
                        //var newPiece = new Piece(PieceType.type[FEN[FENIterator]],row,col,PieceType.white,knightIntervals);
                        break;
                    case 'K': 
                        this.occSquares[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.white, kingIntervals);
                        //var newPiece = new Piece(PieceType.type[FEN[FENIterator]],row,col,PieceType.white,kingIntervals);
                        break;
                    case 'P':
                        this.occSquares[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.white, [{dx: 1, dy: -1}, {dx: -1, dy: -1}]);
                        //var newPiece = new Piece(PieceType.type[FEN[FENIterator]],row,col,PieceType.white,[{dx: 1, dy: -1}, {dx: -1, dy: -1}]);
                        break;
                }
                // this.occSquares[row][col] = PieceType.white;
                // this.avPieces.push(newPiece);

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
                    return (piece.isOppositeColour(this.occSquares,destRow, destCol))
                }else if ((Math.abs(destRow - piece.row) === 2) && (Math.abs(destCol-piece.col) === 1)) {
                    return (piece.isOppositeColour(this.occSquares,destRow, destCol))
                } 
                break;
        }

        //pawns have special cases so put them seperately 

        if (piece.colourAndPiece() == (PieceType.pawn ^ PieceType.white)){    
            if (piece.col === destCol){
                if (piece.row === 6){  // if white pawn on starting square
                    if (piece.row - destRow === 2){ // if moves twice
                        if ((this.occSquares[4][destCol] == PieceType.none) && (this.occSquares[5][destCol] == PieceType.none)){
                            this.pawnMovedTwoSquares = true;
                            this.pawnMovedTwoSquaresCol = destCol;
                            return true;
                        }
                    }
                    else if (piece.row - destRow === 1){ // if moves once
                        if (this.occSquares[5][destCol] == PieceType.none){
                            this.pawnMovedTwoSquares = false;
                            return true;
                        }
                    }
                }        
                else{
                    if (piece.row-destRow == 1){ //if not on starting square
                        if (this.occSquares[destRow][destCol] == PieceType.none){
                            this.pawnMovedTwoSquares = false;
                            return true;
                        }
                    }
                }
            }else if ((piece.row - destRow === 1) && (piece.col - destCol === 1 || piece.col - destCol === -1)){ //diagonal capture
                if ((this.occSquares[destRow][destCol] !== 0) && (piece.isOppositeColour(this.occSquares,destRow,destCol))) return true;
                else if ((this.pawnMovedTwoSquares === true) && (piece.row === 3) && (destCol === this.pawnMovedTwoSquaresCol)){
                    this.enPassentTaken = true;
                    this.pawnMovedTwoSquares = false;
                    return true; //en passent
                }
            }
        }
        else if(piece.colourAndPiece() == (PieceType.pawn ^ PieceType.black)){
            if (piece.col === destCol){
                if (piece.row === 1){  // if black pawn on starting square
                    if (destRow - piece.row === 2){ //if moves twice
                        if ((this.occSquares[3][destCol] == PieceType.none) && (this.occSquares[2][destCol] == PieceType.none)){
                            this.pawnMovedTwoSquares = true;
                            this.pawnMovedTwoSquaresCol = destCol;
                            return true;
                        }
                    }
                    else if (destRow - piece.row === 1){
                        if (this.occSquares[2][destCol] == PieceType.none){
                            this.pawnMovedTwoSquares = false;
                            return true;
                        }
                    }
                }        
                else{
                    if (this.occSquares[destRow][destCol] == PieceType.none){
                        this.pawnMovedTwoSquares = false;
                        return true;
                    }
                }
            }
            else if ((destRow - piece.row === 1) && (piece.col - destCol === 1 || piece.col - destCol === -1)){ //diagonal capture
                if ((this.occSquares[destRow][destCol] !== 0 ) && (piece.isOppositeColour(this.occSquares,destRow,destCol)))return true;
                else if ((this.pawnMovedTwoSquares === true) && (piece.row === 4) && (destCol === this.pawnMovedTwoSquaresCol)){
                    this.enPassentTaken = true;
                    this.pawnMovedTwoSquares = false;
                    return true; //en passent
                }
            }
        }  
    }

    isLegalKingMove(piece,destRow,destCol){

        if (this.whiteToMove === true && piece.colour === PieceType.black) return false;
        if (this.whiteToMove === false && piece.colour === PieceType.white) return false;

        if ((destCol - piece.col) >= 2 && piece.row === destRow){ //if attempts to short castle
            if((this.whiteToMove && this.whiteShortCastlingRights) === true){
                if (this.checkKingRank(piece,1)){ // checks if there are pieces in the way (dir 1 = right)
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

        if (this.occSquares[newRow][newCol].type === PieceType.rook){ // if a piece has been captured 
            this.checkRookCapture();   //has to remove castling rights so another rook cant be placed there and castle      
        }
      
        this.occSquares[piece.row][piece.col] = 0;
        this.occSquares[newRow][newCol] = piece;
      
        piece.updateSquare(newRow,newCol);
    }

    updateEnPassentMove(piece,destRow,destCol){

        for(let i = 0; i < this.avPieces.length; i++){
            if (
                (this.avPieces[i].row === destRow + 1 || this.avPieces[i].row === destRow - 1) 
                && (this.avPieces[i].col === destCol) 
                && this.avPieces[i].colourAndPiece() !== piece.colourAndPiece()
                )
            {
                this.occSquares[this.avPieces[i].row][this.avPieces[i].col] = 0;

                this.avPieces.splice(i,1);
                break;
            }
        }

        piece.row = destRow;
        piece.col = destCol;
        this.occSquares[destRow][destCol] = piece.colour;

    }

    shortCastles(king){
            
        this.occSquares[king.row][7].updateSquare(this.avPieces[i].row, 5); //change rooks position in piece object

        this.occSquares[king.row][7] = 0; 
        this.occSquares[king.row][5] = king.colour; //changes rooks position on occsquares

        this.occSquares[king.row][4] = 0; //changes king position
        this.occSquares[king.row][6] = king.colour;
        
        king.updateSquare(king.row, 6);
       
    }

    longCastles(king){
        this.occSquares[king.row][0].updateSquare(this.avPieces[i].row, 3); //change rooks position in piece object

        this.occSquares[king.row][0] = 0;
        this.occSquares[king.row][2] = this.avPieces[i].colour; //change rooks position on occsquares

        this.occSquares[king.row][4] = 0;
        this.occSquares[king.row][2] = king.colour; //cahnges king position on occsquares

        king.updateSquare(king.row, 2); //change king object position
    }

    legalSquares(piece){ //gets all available squares for piece passed in
        var legalCoords = [];

        for (let options of piece.intervals){
            var col_temp = piece.col + options.dx;
            var row_temp = piece.row + options.dy;

            print('in');

            while(isOnBoard(row_temp,col_temp)){ //while hasn't gone outside of the array
                if (this.occSquares[row_temp][col_temp] === 0){
                    legalCoords.push(row_temp + '' + col_temp);
                    print('0');
                }
                else{
                    print('hit');
                    if ((this.occSquares[row_temp][col_temp].colour & piece.colour) === 0){ // opposite colours
                        legalCoords.push(row_temp + '' + col_temp);
                    }
                    break;
                } 
                col_temp += options.dx;
                row_temp += options.dy;
                print('hoig');
            }
        }
        print(legalCoords);
        print('hey');
        return legalCoords;
    }

    allPiecesLegalSquares(piece){
        let arr = [];

        switch (piece.type){
            case PieceType.knight: 
                for (let options of piece.intervals){
                    var col_temp =  piece.col + options.dx;
                    var row_temp = piece.row + options.dy;
        
                    if (isOnBoard(row_temp,col_temp)){
                        if ((this.occSquares[row_temp][col_temp].colour & piece.colour) === 0){
                            arr.push(row_temp + '' + col_temp);
                        }
                    }
                }
                break;
            case PieceType.king:
                for (let options of piece.intervals){
                    var col_temp =  piece.col + options.dx;
                    var row_temp = piece.row + options.dy;
        
                    if (isOnBoard(row_temp,col_temp)){
                        if (this.maskMap[row_temp][col_temp].colour === 0){
                            arr.push(row_temp + '' + col_temp);
                        }
                    }
                }
                break; 
            case PieceType.pawn:
                if (piece.colourAndPiece() == (PieceType.pawn ^ PieceType.white)){    
                    if (piece.row === 6){  // if white pawn on starting square
                        if (this.occSquares[5][piece.col] === PieceType.none) {
                            arr.push(5 + '' + piece.col);
                            if (this.occSquares[4][piece.col] == PieceType.none) arr.push(4 + '' + piece.col);
                        }
                    }        
                    else{ //if not on starting square
                        if (this.occSquares[piece.row - 1][piece.col] == PieceType.none){
                            arr.push((piece.row - 1) + '' + piece.col);
                        }
                    }
                
                    //diagonal capture
                    for (let i = 1; i >= -1 ; i -= 2){
                        if ((this.occSquares[piece.row - 1][piece.col + i] !== 0) && (piece.isOppositeColour(this.occSquares, piece.row - 1, piece.col + i))) arr.push((piece.row - 1) + '' + (piece.col + i));
                    }
                
                    if ((this.pawnMovedTwoSquares === true) && (piece.row === 3)){
                        arr.push((piece.row - 1) + '' + this.pawnMovedTwoSquaresCol);
                    }
                    
                }
                else if(piece.colourAndPiece() == (PieceType.pawn ^ PieceType.black)){
                    if (piece.row === 1){  // if white pawn on starting square
                        if (this.occSquares[2][piece.col] == PieceType.none){
                            arr.push(2 + '' + piece.col)
                            if (this.occSquares[3][piece.col] == PieceType.none) arr.push(3 + '' + piece.col);
                        }
                    }        
                    else{ //if not on starting square
                        if (this.occSquares[piece.row + 1][piece.col] == PieceType.none){
                            arr.push((piece.row + 1) + '' + piece.col);
                        }
                    }
                
                    //diagonal capture
                    for (let i = 1; i >= -1 ; i -= 2){
                        if ((this.occSquares[piece.row + 1][piece.col + i] !== 0) && (piece.isOppositeColour(this.occSquares, piece.row + 1, piece.col + i))) arr.push((piece.row + 1) + '' + (piece.col + i));
                    }
                
                    if ((this.pawnMovedTwoSquares === true) && (piece.row === 3)){
                        arr.push((piece.row + 1) + '' + this.pawnMovedTwoSquaresCol);
                    }
                }
                break;
            default:
                for (let options of piece.intervals){
                    var col_temp =  piece.col + options.dx;
                    var row_temp = piece.row + options.dy;
    
                    while(isOnBoard(row_temp,col_temp)){ //while hasn't gone outside of the array
                        if (this.occSquares[row_temp][col_temp] === 0){
                            arr.push(row_temp + '' + col_temp);
                        }
                        else{ //if a piece has been hit
                            if ((this.occSquares[row_temp][col_temp].colour & piece.colour) === 0){ // opposite colours
                                arr.push(row_temp + '' + col_temp);
                            }
                            break;
                        } 
                        col_temp += options.dx;
                        row_temp += options.dy;
                    }
                }
                
        } 
        return arr;
    }

    changeTurn(){ // black -> white || white -> black
        if (this.whiteToMove === true){
            this.whiteToMove = false;
        }else this.whiteToMove = true;
    }

    checkKingRank(king,dir){ //checks if there are pieces on the way of castling
        for (let i = dir; Math.abs(i) <= 4; i += dir){
            if (this.maskMap[king.row][king.col + i] !== 0){ //if piece has been hit

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
        if (this.occSquares[0][0].colour !== 16) this.blackLongCastlingRights = false; //black 'a' rook
        else if (this.occSquares[0][7].colour !== 16) this.blackShortCastlingRights = false; //black 'h' rook
        else if (this.occSquares[7][0].colour !== 8) this.whiteLongCastlingRights = false; //white 'a' rook
        else if(this.occSquares[7][7].colour !== 8) this.whiteShortCastlingRights = false; //white 'h' rook
    }

    //piecesToMove is passed in as a piece may be moved in nextMoveBitmap

    findColouredPieces(findWhite, piecesToMove, position){

        let pieceInfo = {pieces: [], oppKingRow: 0, oppKingCol : 0, kingRow: 0, kingCol: 0};

        if (findWhite == false){ //find black
            //returns black pieces and kings
            for(let i = 0; i < piecesToMove.length; i++){
                //when finding pieces, make sure there aren't any 'captured' pieces (in nextMoveBitmap) being found
                if ((piecesToMove[i].colour === PieceType.black) && (position[piecesToMove[i].row][piecesToMove[i].col] == piecesToMove[i].colour)){ 
                    pieceInfo.pieces.push(piecesToMove[i])
                }
                if (piecesToMove[i].colourAndPiece() === (PieceType.king ^ PieceType.white)){
                    pieceInfo.oppKingRow = piecesToMove[i].row;
                    pieceInfo.oppKingCol = piecesToMove[i].col;
                }
                else if(piecesToMove[i].colourAndPiece() === (PieceType.king ^ PieceType.black)){
                    pieceInfo.kingRow = piecesToMove[i].row;
                    pieceInfo.kingCol = piecesToMove[i].col;
                }
            }
        }
        else{
            //returns white pieces and both king
            for(let i = 0; i < piecesToMove.length; i++){
                if ((piecesToMove[i].colour === PieceType.white) && (position[piecesToMove[i].row][piecesToMove[i].col] === piecesToMove[i].colour)){
                    pieceInfo.pieces.push(piecesToMove[i])
                }
                if (piecesToMove[i].colourAndPiece() === (PieceType.king ^ PieceType.black)){
                    pieceInfo.oppKingRow = piecesToMove[i].row;
                    pieceInfo.oppKingCol = piecesToMove[i].col;
                }else if(piecesToMove[i].colourAndPiece() === (PieceType.king ^ PieceType.white)){
                    pieceInfo.kingRow = piecesToMove[i].row;
                    pieceInfo.kingCol = piecesToMove[i].col;
                }
            }
            
        }
        return pieceInfo;
    }

    kingInCheck(){
        let wKing, bKing;
        let numKingsFound;
        for (let i = 0; i < 8; i++){
            for (let j = 0; j < 8; j++){
                if (this.occSquares[i][j] !== 0 && this.occSquares[i][j].colourAndPiece() === (PieceType.king ^ PieceType.white)){
                    wKing = this.occSquares[i][j];
                    numKingsFound++;
                }
                else if (this.occSquares[i][j] !== 0 && this.occSquares[i][j].colourAndPiece() === (PieceType.king ^ PieceType.black)){
                    bKing = this.occSquares[i][j];
                    numKingsFound++; 
                }
                if (numKingsFound === 2) break;
            }
            // if(this.avPieces[i].colourAndPiece() === (PieceType.king ^ PieceType.white)){ //when white moves, check if they put the black king in check
            //     wKing = this.avPieces[i];
            //     numKingsFound++;
            // }
            // else if (this.avPieces[i].colourAndPiece() === (PieceType.king ^ PieceType.black)){
            //     bKing = this.avPieces[i];
            //     numKingsFound++;
            // }
            if (numKingsFound === 2) break;
        }


        if ((!this.whiteToMove && this.maskMap[wKing.row][wKing.col] === 1) || (this.whiteToMove && this.maskMap[bKing.row][bKing.col] === 1)) return true
        
    }

    //generate an array of where all pieces attack in the position
    //if the king is in an attacked square (represented as 1) they are in check -> therefore disallow that move

    findMaskSquares(findAttacksFromWhite, position){ //gets all available squares that the pieces can move to (excluding captures since they aren't necessary)
        let bitmap = create2dArray(8,8);
        var oppKingRow,oppKingCol;
        var kingRow, kingCol;
        let pieces = [];

        
        // pieces = pieceInfo.pieces;
        // oppKingRow = kingRow
        // oppKingCol = kingCol
        // kingRow = pieceInfo.kingRow;
        // kingCol = pieceInfo.kingCol;

        // print(oppKingRow);
        // print(oppKingCol);

        //if white to move -> when finding the squares ignore the white king

        let colourCalc = 16; //if black
        if (findAttacksFromWhite) colourCalc = 8 //if white

        for (var i = 0; i < 8; i++){
            for (var j = 0; j < 8; j++){
                if (position[i][j] !== 0){ //if isn't empty
                    if ((position[i][j].colour & colourCalc) === colourCalc){ //if the piece is from the side you want to find attacks from 

                        switch (position[i][j].type){
                            case PieceType.knight: case PieceType.king: case PieceType.pawn:
                                for (let options of position[i][j].intervals){
                                    var col_temp = j + options.dx;
                                    var row_temp = i + options.dy;
                        
                                    if (isOnBoard(row_temp,col_temp)){
                                        if (position[row_temp][col_temp] === 0){
                                            bitmap[row_temp][col_temp] = 1;
                                        }
                                        else{
                                            if (position[row_temp][col_temp].type === PieceType.king && (position[row_temp][col_temp].colour & colourCalc) === 0) { //if its the king then still choose that square
                                                bitmap[row_temp][col_temp] = 1;
                                            }
                                        }
                                    }
                                }
                                break;
                            default:
                                for (let options of position[i][j].intervals){
                                    var col_temp = j + options.dx;
                                    var row_temp = i + options.dy;
                    
                                    while(isOnBoard(row_temp,col_temp)){ //while hasn't gone outside of the array
                                        if (position[row_temp][col_temp] === 0){
                                            bitmap[row_temp][col_temp] = 1;
                                        }
                                        else{ //if a piece has been hit
                                            if (position[row_temp][col_temp].type === PieceType.king && (position[row_temp][col_temp].colour & colourCalc) === 0) { //if its the king then continue
                                                bitmap[row_temp][col_temp] = 1;
                                            }else{
                                                if (position[row_temp][col_temp].type !== PieceType.king) {
                                                    bitmap[row_temp][col_temp] = 1; 
                                                break;
                                                } 
                                            } 
                                        } 
                                        col_temp += options.dx;
                                        row_temp += options.dy;
                                    }
                                }
                                break; 
                        }
                    }
                }
        
            }

            // switch (pieces[i].type){
            //     case PieceType.knight: case PieceType.king: case PieceType.pawn:
            //         for (let options of pieces[i].intervals){
            //             var col_temp =  pieces[i].col + options.dx;
            //             var row_temp = pieces[i].row + options.dy;
            
            //             if (isOnBoard(row_temp,col_temp)){
            //                 if (position[row_temp][col_temp] === 0){
            //                     bitmap[row_temp][col_temp] = 1;
            //                 }
            //                 else{
            //                     if ((row_temp === oppKingRow) && (col_temp === oppKingCol)) { //if its the king then still choose that square
            //                         bitmap[row_temp][col_temp] = 1;
            //                     }
            //                 }
            //             }
            //         }
            //         break;
            //     default:
            //         for (let options of pieces[i].intervals){
            //             var col_temp =  pieces[i].col + options.dx;
            //             var row_temp = pieces[i].row + options.dy;
        
            //             while(isOnBoard(row_temp,col_temp)){ //while hasn't gone outside of the array
            //                 if (position[row_temp][col_temp] === 0){
            //                     bitmap[row_temp][col_temp] = 1;
            //                 }
            //                 else{ //if a piece has been hit
            //                     if (((row_temp === oppKingRow) && (col_temp === oppKingCol))) { //if its the king then continue
            //                         bitmap[row_temp][col_temp] = 1;
            //                     }else{
            //                         if (!((row_temp === kingRow) && (col_temp === kingCol))) {
            //                             bitmap[row_temp][col_temp] = 1; 
                                       
            //                         break;
            //                         } 
            //                     } 
            //                 } 
            //                 col_temp += options.dx;
            //                 row_temp += options.dy;
            //             }
            //         }
            //         break;
            // }
            
        }

        return bitmap;
    }

    maskBitMap(bitmap){
        this.maskMap = create2dArray(8,8);
  
        for(var i = 0; i < 8; i++){
            for (var j = 0; j < 8; j++){
                if (bitmap[i][j] === 1) {
                    this.maskMap[i][j] = 1;
                }
                else{
                    if (this.occSquares[i][j] === 0 ) this.maskMap[i][j] = 0;
                    else this.maskMap[i][j] = this.occSquares[i][j].colour;
                }
            }
        }
    }

    checkNextMoveBitmap(piece, destRow, destCol){
        //finds your king and makes sure you don't make a move that puts yourself into check
        let tempRow = piece.row;
        let tempCol = piece.col
        let pieceLoc;

        let outOfCheck = true;

        let kingRow,kingCol;

        let bitmap;
        
        let newPosition = this.occSquares; //doesn't make a copy but it makes it more clearer what it is used for

        if (piece.row === destRow && piece.col === destCol) return false; //a move hasnt actually been made 


        newPosition[piece.row][piece.col] = 0;
        newPosition[destRow][destCol] = piece;
       

        print('new');
        print(newPosition);

        for (let i = 0; i < 8; i++){
            for (let j = 0; j < 8; j++){
                if (newPosition[i][j] !== 0){
                    print(PieceType.white ^ PieceType.king)
                    if (this.whiteToMove && (newPosition[i][j].colourAndPiece() === (PieceType.white ^ PieceType.king))){
                        kingRow = i;
                        kingCol = j;
                        break;
                    }
                    else if(!this.whiteToMove && (newPosition[i][j].colourAndPiece() === (PieceType.black ^ PieceType.king))){
                        kingRow = i;
                        kingCol = j;
                        break;
                    }
                }
            }
        }
        print('kong pos');
        print(kingRow);
        print(kingCol);

        //create an updated board
        // for (let i = 0; i < piecesToMove.length; i++){ 
        //     if (i !== pieceLoc) newPosition[piecesToMove[i].row][piecesToMove[i].col] = piecesToMove[i].colour; 
        // }
        // newPosition[destRow][destCol] = piecesToMove[pieceLoc].colour; 

        //find opposite coloured pieces
        //let pieceInfo = this.findColouredPieces(!this.whiteToMove, piecesToMove, newPosition);

        //find same coloured king
        // kingRow = pieceInfo.oppKingRow;
        // kingCol = pieceInfo.oppKingCol;

        // if (((destRow == kingRow) && (destCol == kingCol)) && piece.type !== PieceType.king){ //make sure king isnt captured
            
        //     return false;
        // } 

        //if the king is to move -> kingRow and kingCol also need to be updated
        // if (piecesToMove[pieceLoc].type === PieceType.king){
        //     kingRow = destRow;
        //     kingCol = destCol;
        // }

        //create and mask the bitmap for the new position
        bitmap = this.findMaskSquares(!this.whiteToMove, newPosition);
        print(bitmap);
        this.maskBitMap(bitmap);

        
        print(this.maskMap);
        print(newPosition);


        print(this.maskMap[kingRow][kingCol] === 1);

        if (this.maskMap[kingRow][kingCol] === 1) outOfCheck = false; //this is the line that makes it all happen -> disallows pinned pieces and stuff from putting the king in check
    
        print('out of');
        print(outOfCheck);

        newPosition[piece.row][piece.col] = piece;
        newPosition[destRow][destCol] = 0;


        // piecesToMove[pieceLoc].row = tempRow; //move piece back to original square
        // piecesToMove[pieceLoc].col = tempCol;

        return outOfCheck;
    }

    findBlockableSquares(piecesToBlock){
        var pieces = piecesToBlock.pieces;
        let kingToAttackRow = piecesToBlock.oppKingRow;
        let kingToAttackCol = piecesToBlock.oppKingCol;
        var blockableSquares = [];
        var tempSquares;
        let numPiecesAttacking = 0;

        for (let i = 0; i < pieces.length; i++){
            
            switch (pieces[i].type){  
                case PieceType.knight: case PieceType.king: case PieceType.pawn:
                    break; // these can't be blocked and the king can't check another king
                default:    
                    for (let options of pieces[i].intervals){
                        var col_temp =  pieces[i].col + options.dx;
                        var row_temp = pieces[i].row + options.dy;
                        
                        tempSquares = [];

                        while(isOnBoard(row_temp,col_temp)){ //while hasn't gone outside of the array
                            if (this.occSquares[row_temp][col_temp] === 0){
                                tempSquares.push(row_temp + '' + col_temp);
                            }
                            else{
                                if ((row_temp === kingToAttackRow) && (col_temp === kingToAttackCol)) {
                                    blockableSquares = blockableSquares.concat(tempSquares);
                                    blockableSquares.push(pieces[i].row + '' + pieces[i].col) //also store the coords of the piece attacking so you can capture it
                                    numPiecesAttacking++;
                                    
                                    if (numPiecesAttacking >= 2){ //when in double check, you can't block it 
                                        return []; //therefore no squares can be blocked
                                    }
                                }
                                break;
                            } 
                            col_temp += options.dx;
                            row_temp += options.dy;
                        }
                    } 
            }
        }
    

        return blockableSquares;

    }

    defendCheck(blockableSquares){
        let pieces = [];
        let king;
        var canDefend = [];
        let defenseAvailable = false;

        for (let i = 0; i < this.avPieces.length; i++){
            if (this.whiteToMove && (this.avPieces[i].colour === PieceType.black)){
                if(this.avPieces[i].colourAndPiece() === (PieceType.king ^ PieceType.black)) king = this.avPieces[i]; //store coords of king
                else pieces.push(this.avPieces[i]);//store coords of all same coloured pieces
            }
            else if (!this.whiteToMove && (this.avPieces[i].colour === PieceType.white)){
                if (this.avPieces[i].colourAndPiece() === (PieceType.king ^ PieceType.white)) king = this.avPieces[i];
                else pieces.push(this.avPieces[i]);
            }
        }

        for (let j = 0; j < pieces.length; j++){
            let legalSquare = this.allPiecesLegalSquares(pieces[j]); //go through all pieces and see if they can get in the way of a check
            for (let k = 0; k < legalSquare.length; k++){
                if (blockableSquares.includes(legalSquare[k])){ //if the defending piece attacks a square which blocks a check, store the coords
                    canDefend.push({locOnCoords: pieces[j].row + '' + pieces[j].col, move: legalSquare[k]});
                    defenseAvailable = true;
                }
            }
        }

        for (let options of king.intervals){
            var col_temp =  king.col + options.dx;
            var row_temp = king.row + options.dy; 
            //allow the king to move out of a check
            if (isOnBoard(row_temp,col_temp)){
                if ((this.maskMap[row_temp][col_temp] !== 1) && (this.occSquares[row_temp][col_temp] & king.colour) === 0){
                    canDefend.push({locOnCoords: king.row + '' + king.col, move: row_temp + '' + col_temp})
                    defenseAvailable = true;
                }

            }
        }
        if (!defenseAvailable) return 0;


        return canDefend;
    }

    findPinnedPieceSquares(){
        let piecesToMove = this.findColouredPieces(this.whiteToMove,this.avPieces,this.occSquares);
        let oppositePieces = this.findColouredPieces(!this.whiteToMove,this.avPieces,this.occSquares);
        let king;
        let firstPieceLoc;
        let pinnedPiece = [];
        for (let i = 0; i < this.avPieces.length; i++){
            if ((this.avPieces[i].row === piecesToMove.oppKingRow) && this.avPieces[i].col === piecesToMove.oppKingCol){
                king = this.avPieces[i];
                break;
            }
        }

        for (let options of king.intervals){
            var col_temp = king.col + options.dx;
            var row_temp = king.row + options.dy;

            let pieceHit = false;
            let tempPinnedLegalSquares = [];

            while (isOnBoard(row_temp, col_temp)){
                print('first');
                
                
                if ((king.colour & this.occSquares[row_temp][col_temp]) !== 0){ //if piece has been hit and same colour
                    firstPieceLoc = row_temp + '' + col_temp; //store the location of that piece

                    while (isOnBoard(row_temp, col_temp)){
                        print('second');
                        row_temp += options.dy;
                        col_temp += options.dx;

                        tempPinnedLegalSquares.push((row_temp + '' + col_temp));
                        print(tempPinnedLegalSquares);
                        if (isOnBoard(row_temp,col_temp)){
                            if (this.occSquares[row_temp][col_temp] !== 0){
                                if ((king.colour & this.occSquares[row_temp][col_temp]) === 0){ //if piece has been hit and opposite colour
                                    print('opposite hit');
                                    
                                    for (let i = 0; i < oppositePieces.pieces.length; i++){
                                        //find the piece that has been hit
                                        if ((oppositePieces.pieces[i].row === row_temp) && oppositePieces.pieces[i].col === col_temp){
                                            print('in der');
                                            print(options.dx);
                                            print(options.dy);
                                            //if its any of these three, it can pin the king. The others can't pin the king so don't bother checking them
                                            switch (oppositePieces.pieces[i].type){
                                                case PieceType.queen:
                                                    print(tempPinnedLegalSquares);
                                                    pinnedPiece.push({pieceLoc: firstPieceLoc, pinnedLegalSquares: tempPinnedLegalSquares}); 
                                                    break;
                                                case PieceType.bishop: 
                                                    if (Math.abs(options.dx) === 1 && Math.abs(options.dy) === 1) pinnedPiece.push({pieceLoc: firstPieceLoc, pinnedLegalSquares: tempPinnedLegalSquares});
                                                    break;
                                                case PieceType.rook: 
                                                    if ((Math.abs(options.dx) === 1 && options.dy === 0) || (options.dx === 0 && Math.abs(options.dy) === 1)) pinnedPiece.push({pieceLoc: firstPieceLoc, pinnedLegalSquares: tempPinnedLegalSquares});
                                                    break;
                                                default:
                                                    break;
                                            }
                                        }
                                    }
                                    
                                } else break;
                                
                                pieceHit = true;
                            }
                        }
                        if(pieceHit) break;
                    }
                
                }
                if (pieceHit) break;
                tempPinnedLegalSquares.push(row_temp + '' + col_temp);
                row_temp += options.dy;
                col_temp += options.dx;
            }

        }

        print(pinnedPiece.piece);

        return pinnedPiece;
        
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

    constructor(type, row, col, colour, intervals){
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
