
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
        
        this.occSquares = create2dArray(8,8);
        
        this.moveCounter = 0;
        this.whiteToMove = false;

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

        this.pinnedPieces = [];
        this.piecesToDefendCheck = [];
        this.blockableSquares = [];

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

                switch (FEN[FENIterator]) {
                    case 'b':
                        this.occSquares[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.black);
                        break;
                    case 'r':
                        this.occSquares[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.black);
                        break;
                    case 'q':
                        this.occSquares[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.black);
                        break;
                    case 'n':
                        this.occSquares[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.black);
                        break;
                    case 'k': 
                        this.occSquares[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.black);
                        break;
                    case 'p':
                        this.occSquares[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.black);
                        break;
                }

            }
            else if ((/[A-Z]/).test(FEN[FENIterator])){ //if uppercase (white piece)
                switch (FEN[FENIterator]) {
                    case 'B':
                        this.occSquares[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.white);
                        break;
                    case 'R':
                        this.occSquares[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.white);
                        break;
                    case 'Q':
                        this.occSquares[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.white);
                        break;
                    case 'N':
                        this.occSquares[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.white);
                        //var newPiece = n
                        break;
                    case 'K': 
                        this.occSquares[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.white);
                        break;
                    case 'P':
                        this.occSquares[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.white);
                        break;
                }
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

    isLegalMove(piece, destRow, destCol){
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
            case PieceType.bishop: case PieceType.queen: 
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
                        if (this.occSquares[2][destCol] == PieceType.none){ //if moves once
                            this.pawnMovedTwoSquares = false;
                            return true;
                        }
                    }
                }        
                else{
                    if (destRow - piece.row === 1){
                        if (this.occSquares[destRow][destCol] == PieceType.none){
                            this.pawnMovedTwoSquares = false;
                            return true;
                        }
                    }
                }
            }
            //diagonal capture
            else if ((destRow - piece.row === 1) && (piece.col - destCol === 1 || piece.col - destCol === -1)){ 
                if ((this.occSquares[destRow][destCol] !== 0) && ((this.occSquares[destRow][destCol].colour & piece.colour) === 0) ) return true;
                else if ((this.pawnMovedTwoSquares === true) && (piece.row === 4) && (destCol === this.pawnMovedTwoSquaresCol)){
                    this.enPassentTaken = true;
                    this.pawnMovedTwoSquares = false;
                    return true; //en passent
                }
            }
        }  
    }

    isLegalKingMove(piece,destRow,destCol){

        if (this.whiteToMove === (piece.colour === PieceType.black)) return false; // hehe cool logic

        if ((destCol - piece.col) >= 2 && piece.row === destRow && this.checkKingRank(piece,1)){ //if attempts to short castle
            if(this.whiteShortCastlingRights || this.blackShortCastlingRights){ //if white attempted
                this.shortCastles(piece); //is a legal castle move
                this.removeCastlingRights(true,true);
                this.castled = true;

                return true;
            }
        }  
        else if(destCol - piece.col <= -2 && piece.row === destRow && this.checkKingRank(piece,-1)){ //if attempts to long castle and checks if there are pieces in the way (dir 1 = right)
            if(this.whiteLongCastlingRights || this.blackLongCastlingRights){ //if white attempted
                this.longCastles(piece);
                this.removeCastlingRights(true,true);
                this.castled = true;

                return true;
            }
        }else{
            if(!(Math.abs(destRow - piece.row) > 1) || !Math.abs(destCol - piece.col) > 1) {
                if((this.occSquares[destRow][destCol] === 0) || (piece.colour & this.occSquares[destRow][destCol].colour) === 0){
                    print(this.occSquares);
                    this.removeCastlingRights(true,true);
                    print('this one');
                    return true;
                }
            }
        }
        return false;
    }

    updatePiecePos(piece, newRow, newCol){

        if (this.occSquares[newRow][newCol].type === PieceType.rook){ // if a rook has been captured 
            this.checkRookCapture(newRow, newCol);   //has to remove castling rights so another rook cant be placed there and castle      
        }
      
        this.occSquares[piece.row][piece.col] = 0;
        this.occSquares[newRow][newCol] = piece;
      
        piece.updateSquare(newRow,newCol);
    }

    updateEnPassentMove(piece,destRow,destCol){

        this.occSquares[piece.row][this.pawnMovedTwoSquaresCol] = 0;
        this.occSquares[piece.row][piece.col] = 0;
        this.occSquares[destRow][destCol] = piece;

        piece.updateSquare(destRow, destCol);
        
    }

    shortCastles(king){
        let rook = this.occSquares[king.row][7];
                   
        rook.updateSquare(king.row, 5); //change rooks position in piece object

        this.occSquares[king.row][7] = 0; 
        this.occSquares[king.row][5] = rook; //changes rooks position on occsquares

        this.occSquares[king.row][4] = 0; //changes king position
        this.occSquares[king.row][6] = king;
        
        king.updateSquare(king.row, 6);
       
    }

    longCastles(king){
        let rook = this.occSquares[king.row][0];

        rook.updateSquare(king.row, 3); //change rooks position in piece object

        this.occSquares[king.row][0] = 0;
        this.occSquares[king.row][3] = rook; //change rooks position on occsquares

        this.occSquares[king.row][4] = 0;
        this.occSquares[king.row][2] = king; //changes king position on occsquares

        king.updateSquare(king.row, 2); //change king object position
    }

    legalSquares(piece){ //gets all available squares for piece passed in
        var legalCoords = [];

        for (let options of piece.intervals()){
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
                for (let options of piece.intervals()){
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
                for (let options of piece.intervals()){
                    var col_temp =  piece.col + options.dx;
                    var row_temp = piece.row + options.dy;
        
                    if (isOnBoard(row_temp,col_temp)){
                        if (this.maskMap[row_temp][col_temp] === 0 || (this.maskMap[row_temp][col_temp] & piece.colour === 0)){
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
                    for (let i = 1; i >= -1 ; i -= 2){ //checks both directions
                        if (isOnBoard(piece.row - 1, piece.col + i)){
                            if (this.occSquares[piece.row - 1][piece.col + i] !== 0){
                                if ((this.occSquares[piece.row - 1][piece.col + i].colour & piece.colour) === 0) arr.push((piece.row - 1) + '' + (piece.col + i));
                            }
                        }
                    }
                
                    if ((this.pawnMovedTwoSquares === true) && (piece.row === 3)){
                        arr.push((piece.row - 1) + '' + this.pawnMovedTwoSquaresCol);
                    }
                    
                }
                //
                //black pawns
                //
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
                        if (isOnBoard(piece.row + 1, piece.col + i)){
                            if (this.occSquares[piece.row + 1][piece.col + i] !== 0){ 
                                if ((this.occSquares[piece.row + 1][piece.col + i].colour & piece.colour) === 0) arr.push((piece.row + 1) + '' + (piece.col + i));
                            }
                        }
                    }
                
                    if ((this.pawnMovedTwoSquares === true) && (piece.row === 4)){
                        arr.push((piece.row + 1) + '' + this.pawnMovedTwoSquaresCol);
                    }
                }
                break;
            default:
                for (let options of piece.intervals()){
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
        this.whiteToMove = !this.whiteToMove;
    }

    checkKingRank(king,dir){ //checks if there are pieces on the way of castling
        for (let i = dir; Math.abs(i) <= 4; i += dir){
            if (this.maskMap[king.row][king.col + i] !== 0){ //if piece has been hit

                if (this.maskMap[king.row][Math.min(king.col + i,6)] === 1) return false;
                
                //if piece is same colour rook on the 'h' square
                if ((king.col + i === 7) && this.maskMap[king.row][king.col + i] !== 0) return true;
                //if piece is same colour rook on 'a' square
                else if((king.col + i == 0) && this.maskMap[king.row][king.col + i] !== 0) return true;
                else return false;
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
        if (this.occSquares[0][0].colour !== PieceType.black) this.blackLongCastlingRights = false; //black 'a' rook
        else if (this.occSquares[0][7].colour !== PieceType.black) this.blackShortCastlingRights = false; //black 'h' rook
        else if (this.occSquares[7][0].colour !== PieceType.white) this.whiteLongCastlingRights = false; //white 'a' rook
        else if(this.occSquares[7][7].colour !== PieceType.white) this.whiteShortCastlingRights = false; //white 'h' rook
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
            if (numKingsFound === 2) break;
        }


        if ((!this.whiteToMove && this.maskMap[wKing.row][wKing.col] === 1) || (this.whiteToMove && this.maskMap[bKing.row][bKing.col] === 1)) return true
        
    }

    //generate an array of where all pieces attack in the position
    //if the king is in an attacked square (represented as 1) they are in check -> therefore disallow that move

    findMaskSquares(findAttacksFromWhite, position){ //gets all available squares that the pieces can move to (excluding captures since they aren't necessary)
        let bitmap = create2dArray(8,8);


        let colourCalc = 16; //if black
        if (findAttacksFromWhite) colourCalc = 8 //if white

        print('colour');
        print(colourCalc);

        for (var i = 0; i < 8; i++){
            for (var j = 0; j < 8; j++){
                if (position[i][j] !== 0){ //if isn't empty
                    if ((position[i][j].colour & colourCalc) === colourCalc){ //if the piece is from the side you want to find attacks from 
                        switch (position[i][j].type){
                            case PieceType.knight: case PieceType.king: case PieceType.pawn:
                                for (let options of position[i][j].intervals()){
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
                                for (let options of position[i][j].intervals()){
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
                                                if (position[row_temp][col_temp].type !== PieceType.king) { //doesn't highlight the same coloured king as a valid piece to take
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
            
        }

        return bitmap;
    }

    maskBitMap(bitmap){
        this.maskMap = create2dArray(8,8);

        let pos = this.occSquares.map(arr => arr.slice()); //create copy of occSquares

        for(var i = 0; i < 8; i++){
            for (var j = 0; j < 8; j++){
                if (bitmap[i][j] === 1) {
                    this.maskMap[i][j] = 1;
                }
                else{
                    if (pos[i][j] === 0) this.maskMap[i][j] = 0;
                    else this.maskMap[i][j] = pos[i][j].colour;
                }
            }
        }
    }

    checkNextMoveBitmap(piece, destRow, destCol){ //finds your king and makes sure you don't make a move that puts yourself into check
        let outOfCheck = true;
        let kingRow,kingCol;
        let bitmap;
        let newPosition = this.occSquares.map(arr => arr.slice()); //create copy of occSquares

        if (piece.row === destRow && piece.col === destCol) return false; //a move hasn't actually been made 


        if (this.occSquares[destRow][destCol].type === PieceType.king) return false;
        // if (newPosition[destRow][destCol] !== 0 ){
        //     tempPiece.push(newPosition[destRow][destCol]);
        // }

        newPosition[piece.row][piece.col] = 0;
        newPosition[destRow][destCol] = piece;

        print('hello');
        print(this.occSquares);

        for (let i = 0; i < 8; i++){
            for (let j = 0; j < 8; j++){
                if (newPosition[i][j] !== 0){
                    
                    if (this.whiteToMove && (newPosition[i][j].colourAndPiece() === (PieceType.white ^ PieceType.king))){
                        kingRow = i;
                        kingCol = j;
                        print('found');
                        print(newPosition[i][j]);
                        break;
                    }
                    else if(!this.whiteToMove && (newPosition[i][j].colourAndPiece() === (PieceType.black ^ PieceType.king))){
                        print('found');
                        print(newPosition[i][j]);
                        kingRow = i;
                        kingCol = j;
                        break;
                    }
                }
            }
        }
        

        //create and mask the bitmap for the new position
        bitmap = this.findMaskSquares(!this.whiteToMove, newPosition);
        print(bitmap);
        this.maskBitMap(bitmap);

        if (this.maskMap[kingRow][kingCol] === 1) outOfCheck = false; //this is the line that makes it all happen -> disallows pinned pieces and stuff from putting the king in check

        return outOfCheck;
    }

    findBlockableSquares(){ //when in check, find the squares that a piece can be put in between the king and the checking piece
        var tempSquares;
        let numPiecesAttacking = 0;
        this.blockableSquares = [];

        let colourCalc = 16;
        if (this.whiteToMove) colourCalc = 8;

        for (let i = 0; i < 8; i++){
            for (let j = 0; j < 8; j++){
                if ((this.occSquares[i][j].colour & colourCalc) === colourCalc){
                    switch (this.occSquares[i][j].type){  
                        case PieceType.knight: case PieceType.king: case PieceType.pawn:
                            break; // these can't be blocked and the king can't check another king
                        default:    
                            for (let options of this.occSquares[i][j].intervals()){
                                var col_temp = j + options.dx;
                                var row_temp = i + options.dy;
                                tempSquares = [];

                                while(isOnBoard(row_temp,col_temp)){ //while hasn't gone outside of the array
                                    if (this.occSquares[row_temp][col_temp] === 0){
                                        tempSquares.push(row_temp + '' + col_temp);
                                    }
                                    else{
                                        if ((this.occSquares[row_temp][col_temp].type === PieceType.king) && (colourCalc & this.occSquares[row_temp][col_temp].colour) === 0) {
                                            tempSquares.push(i + '' + j) //stores coords of piece attacking the king
                                            this.blockableSquares = this.blockableSquares.concat(tempSquares);
                                            numPiecesAttacking++;
                                            
                                            if (numPiecesAttacking >= 2){ //when in double check, you can't block it 
                                                return []; //therefore no squares can be blocked
                                            }
                                        }
                                        break;
                                    } 
                                    
                                    //tempSquares.push(row_temp + '' + col_temp);
                                    col_temp += options.dx;
                                    row_temp += options.dy;
                                }
                            } 
                    }
                }
            }
        }

    }

    defendCheck(){
        let king;
        let defenseAvailable = false;
        let piecePinned = false;

        this.piecesToDefendCheck = [];

        for (let i = 0; i < 8; i++){
            for (let j = 0; j < 8; j++){
                if (this.occSquares[i][j] !== 0){
                    if (this.whiteToMove && this.occSquares[i][j].colourAndPiece() === (PieceType.black ^ PieceType.king)){
                        king = this.occSquares[i][j];
                        break;
                    }
                    else if (!this.whiteToMove && this.occSquares[i][j].colourAndPiece() === (PieceType.white ^ PieceType.king)){
                        king = this.occSquares[i][j];
                        break;
                    }
                }
            }
        }

        for (let i = 0; i < 8; i++){
            for (let j = 0; j < 8; j++){
                if (this.occSquares[i][j] !== 0){
                    for (let pinned of this.pinnedPieces){
                        if ((pinned.piece.row === i) && (pinned.piece.col === j)){ 
                            piecePinned = true;
                            break;
                        }
                    }
                    if (piecePinned) break; //a pinned piece can't move out of its pinned squares, thus it cant block the check

                    let legalSquare = this.allPiecesLegalSquares(this.occSquares[i][j]); //go through all pieces and see if they can get in the way of a check
                    for (let k = 0; k < legalSquare.length; k++){
                        if (this.blockableSquares.includes(legalSquare[k])){ //if the defending piece attacks a square which blocks a check, store the coords
                            this.piecesToDefendCheck.push({locOnCoords: this.occSquares[i][j].row + '' + this.occSquares[i][j].col, move: legalSquare[k]});
                            defenseAvailable = true;
                        }
                    }
                }
            }
        }

        for (let options of king.intervals()){
            var col_temp =  king.col + options.dx;
            var row_temp = king.row + options.dy; 
            //allow the king to move out of a check
            if (isOnBoard(row_temp,col_temp)){
                if ((this.maskMap[row_temp][col_temp] !== 1) && (this.occSquares[row_temp][col_temp].colour & king.colour) === 0){
                    this.piecesToDefendCheck.push({locOnCoords: king.row + '' + king.col, move: row_temp + '' + col_temp})
                    defenseAvailable = true;
                }

            }
        }
        if (!defenseAvailable) this.piecesToDefendCheck = 0;

    }

    findPinnedPieceSquares(){ //iterates out from both kings to check for pinned pieces
        let kings = [];
        let numKingsFound;
        let firstPiece;
        let hitSecondPiece;
        let hitFirstPiece;
        
        this.pinnedPieces = [];

        for (let i = 0; i < 8; i++){
            for (let j = 0; j < 8; j++){
                if (this.occSquares[i][j] !== 0){
                    if (this.occSquares[i][j].type === PieceType.king) {
                        kings.push(this.occSquares[i][j]);
                        numKingsFound++;
                        break;
                    }
                }
            }
            if (numKingsFound === 2) break;
        }

        for (let king of kings){
            for (let options of king.intervals()){
                var col_temp = king.col + options.dx;
                var row_temp = king.row + options.dy;
                hitFirstPiece = false;
                hitSecondPiece = false;
                
                let tempPinnedLegalSquares = [];

                while (isOnBoard(row_temp, col_temp)){

                    // checks if there is a piece after it, and if that piece can pin it
                    if (hitFirstPiece){
                        
                        tempPinnedLegalSquares.push((row_temp + '' + col_temp));
                            
                        if (this.occSquares[row_temp][col_temp] !== 0){
                            if ((king.colour & this.occSquares[row_temp][col_temp].colour) === 0){ //if piece has been hit and opposite colour
                                hitSecondPiece = true;
                                switch (this.occSquares[row_temp][col_temp].type){
                                    // checks which piece is potentially pinning it to the king
                                    case PieceType.queen:
                                        if ((Math.abs(options.dx) === 1 && Math.abs(options.dy) === 1) && firstPiece.type === PieceType.bishop) {
                                            this.pinnedPieces.push({piece: firstPiece, pinnedLegalSquares: tempPinnedLegalSquares}); //if diagonal intervals and the bishop is pinned
                                        }
                                        else if (((Math.abs(options.dx) === 1 && options.dy === 0) || (options.dx === 0 && Math.abs(options.dy) === 1)) && firstPiece.type === PieceType.rook) {
                                            this.pinnedPieces.push({piece: firstPiece, pinnedLegalSquares: tempPinnedLegalSquares}); //if rank file intervals and a rook is pinned 
                                        }
                                        else if (firstPiece.type === PieceType.queen) {
                                            this.pinnedPieces.push({piece: firstPiece, pinnedLegalSquares: tempPinnedLegalSquares}); //queen can always defend if pinned
                                        }
                                        else {
                                            this.pinnedPieces.push({piece: firstPiece, pinnedLegalSquares: []}); //can't make any moves whilst pinned
                                        }
                                        break; 
                                    case PieceType.bishop: 
                                        if (firstPiece.type === PieceType.queen || firstPiece.type === PieceType.bishop) this.pinnedPieces.push({piece: firstPiece, pinnedLegalSquares: tempPinnedLegalSquares});
                                        else this.pinnedPieces.push({piece: firstPiece, pinnedLegalSquares: []});
                                        break;
                                    case PieceType.rook: 
                                        if (firstPiece.type === PieceType.rook || firstPiece.type === PieceType.queen) this.pinnedPieces.push({piece: firstPiece, pinnedLegalSquares: tempPinnedLegalSquares}) 
                                        else this.pinnedPieces.push({piece: firstPiece, pinnedLegalSquares: []});
                                        break;
                                    default:
                                        //if its none of the above the piece can't be pinned to the king
                                        break;
                                }
                            
                            } else break;
                            
                        }
                
                    }
                    
                    if(hitSecondPiece) break;

                    if (this.occSquares[row_temp][col_temp] !== 0){
                        if (((king.colour & this.occSquares[row_temp][col_temp].colour) !== 0) && hitFirstPiece === false){ //if piece has been hit and same colour
                            firstPiece = this.occSquares[row_temp][col_temp]; //store the piece
                            hitFirstPiece = true;
                        }
                    }

                    tempPinnedLegalSquares.push(row_temp + '' + col_temp);
                    row_temp += options.dy;
                    col_temp += options.dx;
                }

            }
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
    static pawn = 2;
    static knight = 3;
    static bishop = 4;
    static rook = 5;
    static queen = 6;
    
    static white = 8;
    static black = 16;
}

class Piece {
    
    constructor(type, row, col, colour){
        this.type = type;
        this.row = row;
        this.col = col;
        this.colour = colour;
    }

    static intervalsArr = [[
        {dx: 1,dy: 0},      // rankFileIntervals
        {dx: -1,dy: 0}, 
        {dx: 0,dy: 1}, 
        {dx: 0,dy: -1}
    ], [
        {dx: 1, dy: 1},     // diagIntervals
        {dx: -1, dy : -1},
        {dx: 1, dy: -1},
        {dx: -1, dy: 1}
    ], [
        {dx: 1, dy: -2},    // knightIntervals
        {dx: -1, dy: -2},
        {dx: 1, dy: 2},
        {dx: -1, dy: 2},
        {dx: 2, dy: 1},
        {dx: -2, dy: -1},
        {dx: 2, dy: -1},
        {dx: -2, dy: 1},
    ], [
        {dx:1, dy: 0},       // kingIntervals
        {dx:1, dy: 1}, 
        {dx:1, dy: -1},
        {dx:0, dy: 1},
        {dx:0, dy: -1},
        {dx:-1, dy: 0},
        {dx:-1, dy: 1},
        {dx:-1, dy: -1},
    ]
    ]

    colourAndPiece(){
        return this.colour ^ this.type;
    }

    intervals(){
        switch (this.type) {
            case PieceType.rook:
                return this.intervalsArr[0];
            case PieceType.king:
                return this.intervalsArr[3];
            case PieceType.knight:
                return this.intervalsArr[2];
            case PieceType.bishop:
                return this.intervalsArr[1];
            case PieceType.queen:
                return this.intervalsArr[0].concat(this.intervalsArr[1]);
            case PieceType.pawn:
                if (this.colour === PieceType.white) return [{dx: 1, dy: -1}, {dx: -1, dy: -1}];
                else return [{dx: 1, dy: 1}, {dx: -1, dy: 1}];
        }
    }

    updateSquare(newRow,newCol){
        this.row = newRow;
        this.col = newCol;
    }

    isOppositeColour(occSquares,destRow,destCol){
        if (occSquares[destRow][destCol] === 0) return true
        return (this.colour & occSquares[destRow][destCol].colour) === 0;
    }

}
