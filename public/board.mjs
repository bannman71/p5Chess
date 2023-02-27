
const intervalsArr = [[
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
];

function create2dArray(rows,cols){
    let arr = []
    for(let i = 0; i < cols; i++){
        arr[i] = [];
        for (let j = 0; j < rows; j++){
            arr[i][j] = 0;
        }
    }
    return arr;
}

export function FENToBoard(FEN){
    let arr = create2dArray(8,8);
    let col = 0;
    let row = 0;
    let FENIterator = 0;
    let finalRank = false;
    let finishedIterating = false;
    
    while(!finishedIterating){
        if (!(/[A-Za-z]/).test(FEN[FENIterator]) && FEN[FENIterator] !== '/'){// if its a number
            col += FEN[FENIterator].charCodeAt(0) - 49;
        }

        if ((/[a-z]/).test(FEN[FENIterator])){ // if lowercase (black piece)

            switch (FEN[FENIterator]) {
                case 'b':
                    arr[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.black);
                    break;
                case 'r':
                    arr[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.black);
                    break;
                case 'q':
                    arr[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.black);
                    break;
                case 'n':
                    arr[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.black);
                    break;
                case 'k': 
                    arr[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.black);
                    break;
                case 'p':
                    arr[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.black);
                    break;
            }

        }
        else if ((/[A-Z]/).test(FEN[FENIterator])){ //if uppercase (white piece)
            switch (FEN[FENIterator]) {
                case 'B':
                    arr[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.white);
                    break;
                case 'R':
                    arr[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.white);
                    break;
                case 'Q':
                    arr[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.white);
                    break;
                case 'N':
                    arr[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.white);
                    //var newPiece = n
                    break;
                case 'K': 
                    arr[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.white);
                    break;
                case 'P':
                    arr[row][col] = new Piece(PieceType.type[FEN[FENIterator]], row, col, PieceType.white);
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

    return arr;
}

export function instantiateNewBoard(board, FEN){
    var newBoard;
    newBoard = new Board(FEN);
    newBoard.moveCounter = board.moveCounter;
    newBoard.whiteToMove = board.whiteToMove;
    newBoard.blackShortCastlingRights = board.blackShortCastlingRights;
    newBoard.blackLongCastlingRights = board.blackLongCastlingRights;
    newBoard.whiteShortCastlingRights = board.whiteShortCastlingRights;
    newBoard.whiteLongCastlingRights = board.whiteLongCastlingRights;

    newBoard.pawnMovedTwoSquares = board.pawnMovedTwoSquares;
    newBoard.pawnMovedTwoSquaresCol = board.pawnMovedTwoSquaresCol;
    newBoard.enPassentTaken = board.enPassentTaken;
    newBoard.isInCheck = board.isInCheck;
    newBoard.maskMap = board.maskMap;
    newBoard.shortCastles = false
    newBoard.longCastles = false;

    return newBoard;
}


export default class Board {

    constructor(FEN, moveCounter, whiteToMove, castlesShortBlack, castlesLongBlack, castlesShortWhite, castlesLongWhite){
        this.occSquares = FENToBoard(FEN);
        
        this.moveCounter = moveCounter;
        this.whiteToMove = whiteToMove;

        this.blackShortCastlingRights = castlesShortBlack;
        this.blackLongCastlingRights = castlesLongBlack;
        this.whiteShortCastlingRights = castlesShortWhite;
        this.whiteLongCastlingRights = castlesLongWhite;

        //make it possible to emit board with methods over network
        
        this.maskMap = create2dArray(8,8);

        this.pawnMovedTwoSquares = false;
        this.pawnMovedTwoSquaresCol = 0;
        this.enPassentTaken = false;

        this.isInCheck = false;

        this.shortCastles = false;
        this.longCastles = false;

        this.castled = false;

    }

    
    boardToFEN(){
        let FEN = "";
        let numEmpty;

        for (let i = 0; i < 8; i++){
            for (let j = 0; j < 8; j++){

                if (this.occSquares[i][j] === 0){
                    numEmpty = 1;
                    for (let k = j; k < 8; k++){
                        if (this.occSquares[i][k] !== 0){ //if a piece is now there
                            //stop and concatenate the number of empty squares
                            FEN += numEmpty - 1;
                            j = k;
                            break;
                        }
                        else if (k === 7){
                            FEN += numEmpty;
                            j = k;
                            break;
                        }
                        numEmpty++;
                    }
                }
                
                if (this.occSquares[i][j] !== 0){
                    FEN += (PieceType.numToType[this.occSquares[i][j].colourAndPiece()]);
                }

            }
            if (i !== 7) FEN += "/";
        }

        return FEN;
    }

    pieceMovedNotation(pieceMoved, target) {
        let col = {0: 'a', 1: 'b', 2: 'c', 3: 'd', 4: 'e', 5: 'f', 6: 'g', 7: 'h'};
        let moveNotation = '';

        let captures = this.occSquares[target.row][target.col] !== 0;

        moveNotation += PieceType.numToPGNType[pieceMoved.colourAndPiece()];

        if ((pieceMoved.type !== PieceType.king) && (pieceMoved.type !== PieceType.pawn)) {
            let attacksFromSquare = this.attacksFromSquare(pieceMoved, target.row, target.col);


            for (let i = 0; i < attacksFromSquare.length; i++) {
                let currSquare = this.occSquares[attacksFromSquare[i].row][attacksFromSquare[i].col];

                //if we iterate over a piece which is the same type as we moved but isn't the piece we moved
                if (currSquare !== 0 && currSquare.colourAndPiece() === pieceMoved.colourAndPiece() && (currSquare.rowAndCol() !== pieceMoved.rowAndCol())) {
                    //TODO
                    //works except for knights
                    let ovlpPieceAttacks = this.allPiecesLegalSquares(currSquare);
                    for (let k = 0; k < ovlpPieceAttacks.length; k++) {
                        if (ovlpPieceAttacks[k] == (target.row + '' + target.col)) {
                            if (currSquare.col !== pieceMoved.col) {
                                moveNotation += col[pieceMoved.col];
                            } else if (currSquare.row !== pieceMoved.row) {
                                moveNotation += (8 - pieceMoved.row);
                            }


                        }
                    }
                }
            }
        }
        if (captures) {
            if (pieceMoved.type === PieceType.pawn) moveNotation += col[pieceMoved.col];
            moveNotation += 'x'
        }

        moveNotation += col[target.col] + '' + (8 - target.row);

        return moveNotation;
    }

    isLegalMove(piece, destRow, destCol) {
        var destPos = destRow + '' + destCol;

        if (this.whiteToMove === true && piece.colour === PieceType.black) return false;
        if (this.whiteToMove === false && piece.colour === PieceType.white) return false;

        if (piece.row === destRow && piece.col === destCol) {
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

        if (this.whiteToMove && (piece.colour === PieceType.black)) return false;
        else if (!this.whiteToMove && (piece.colour === PieceType.white)) return false;

        if (!this.isInCheck && (destCol - piece.col) >= 2 && piece.row === destRow && (this.checkKingRank(piece, 1))){ //if attempts to short castle
            if((this.whiteToMove && this.whiteShortCastlingRights) || (!this.whiteToMove && this.blackShortCastlingRights)){ //if white attempted
                this.shortCastles = true; //is a legal castle move
                return true;
            }
        }  
        else if(!this.isInCheck && destCol - piece.col <= -2 && piece.row === destRow && this.checkKingRank(piece, -1)){ //if attempts to long castle and checks if there are pieces in the way (dir 1 = right)
            if((this.whiteToMove && this.whiteLongCastlingRights) || (!this.whiteToMove && this.blackLongCastlingRights)){ //if white attempted
                this.longCastles = true;
                return true;
            }
        }else{
            if(!(Math.abs(destRow - piece.row) > 1) && !(Math.abs(destCol - piece.col) > 1)) {
                if((this.occSquares[destRow][destCol] === 0) || (piece.colour & this.occSquares[destRow][destCol].colour) === 0){
                    this.removeCastlingRights(true,true);
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
      
        if (this.shortCastles){
            this.shortCastlePiece(piece);
            this.removeCastlingRights(true,true);
        }
        else if(this.longCastles){
            this.longCastlePiece(piece);
            this.removeCastlingRights(true,true);
        }else {
            this.occSquares[piece.row][piece.col] = 0;
            this.occSquares[newRow][newCol] = piece;
            piece.updateSquare(newRow,newCol);
        }
    }

    updateEnPassentMove(piece,destRow,destCol){

        this.occSquares[piece.row][this.pawnMovedTwoSquaresCol] = 0;
        this.occSquares[piece.row][piece.col] = 0;
        this.occSquares[destRow][destCol] = piece;

        piece.updateSquare(destRow, destCol);
        
    }

    shortCastlePiece(king){
        let rook = this.occSquares[king.row][7];
                   
        rook.updateSquare(king.row, 5); //change rooks position in piece object

        this.occSquares[king.row][7] = 0; 
        this.occSquares[king.row][5] = rook; //changes rooks position on occsquares

        this.occSquares[king.row][4] = 0; //changes king position
        this.occSquares[king.row][6] = king;
        
        king.updateSquare(king.row, 6);
       
    }

    longCastlePiece(king){
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


            while(this.isOnBoard(row_temp,col_temp)){ //while hasn't gone outside of the array
                if (this.occSquares[row_temp][col_temp] === 0){
                    legalCoords.push(row_temp + '' + col_temp);
                }
                else{
                    if ((this.occSquares[row_temp][col_temp].colour & piece.colour) === 0){ // opposite colours
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
    //choose a square and piece, this will calculate which squares will attack if on that square
    attacksFromSquare(piece, row, col){
        let arr = [];

        switch (piece.type){
            case PieceType.knight:
                for (let options of piece.intervals()){
                    var col_temp = col + options.dx;
                    var row_temp = row + options.dy;

                    if (this.isOnBoard(row_temp,col_temp))
                    {
                        arr.push({"row": row_temp, "col": col_temp});
                    }
                }
                break;
            default:
                for (let options of piece.intervals()){
                    var col_temp = col + options.dx;
                    var row_temp = row + options.dy;

                    while(this.isOnBoard(row_temp,col_temp)){ //while hasn't gone outside the array
                        if (this.occSquares[row_temp][col_temp] === 0){
                            arr.push({"row": row_temp, "col": col_temp});
                        }
                        else{ //if a piece has been hit
                            arr.push({"row": row_temp, "col": col_temp});
                            break;
                        }
                        col_temp += options.dx;
                        row_temp += options.dy;
                    }
                }

        }
        return arr;
    }

    allPiecesLegalSquares(piece){
        let arr = [];

        switch (piece.type){
            case PieceType.knight: 
                for (let options of piece.intervals()){
                    var col_temp =  piece.col + options.dx;
                    var row_temp = piece.row + options.dy;
        
                    if (this.isOnBoard(row_temp,col_temp))
                    { 
                        if ((this.occSquares[row_temp][col_temp] === 0 || (this.occSquares[row_temp][col_temp] !== 0 && (this.occSquares[row_temp][col_temp].colour & piece.colour) === 0)) && this.checkNextMoveBitmap(piece,row_temp,col_temp)){
                            arr.push(row_temp + '' + col_temp);
                        }
        
                    }
                }
                break;
            case PieceType.king:
                for (let options of piece.intervals()){
                    var col_temp = piece.col + options.dx;
                    var row_temp = piece.row + options.dy;
        
                    console.log(piece.colour);

                    if (this.isOnBoard(row_temp,col_temp)){

                        // if (this.maskMap[row_temp][col_temp] !== 0){
                        //     console.log('opopopopopopopopopop');
                        //     // if (this.maskMap[row_temp][col_temp] !== 1) {
                        //     //     console.log(this.maskMap[row_temp][col_temp]);
                        //     //     console.log('colour');
                        //     //     console.log(this.maskMap[row_temp][col_temp]);
                        //     // }
                        //     // console.log(this.maskMap[row_temp][col_temp] !== 1);
                        //     // console.log(piece.colour);
                        //     console.log(row_temp + ' a ' + col_temp);
                        //     if (this.maskMap[row_temp][col_temp] != 1 && (this.maskMap[row_temp][col_temp] & piece.colour) === 0){
                        //         console.log(row_temp + ' ' + col_temp);
                        //         console.log('asdghjkasdghjasdghjasd');
                        //     }
                        // }

                        


                       
                        console.log('there is a thing')
                        if (((this.maskMap[row_temp][col_temp] & piece.colour) === 0) || this.maskMap[row_temp][col_temp] === 0){
                            console.log('temp');
                            let temp = this.checkNextMoveBitmap(piece, row_temp, col_temp);
                            console.log(temp);
                            if (temp == true){
                                console.log('yea its legal');
                                console.log(this.occSquares[row_temp][col_temp]);
                                arr.push(row_temp + '' + col_temp);
                                console.log(arr);
                            }
                        }

                    }
                }
                if (!this.isInCheck){
                    if (this.whiteToMove){
                        if (this.whiteShortCastlingRights && this.checkKingRank(piece, 1)) arr.push(piece.row + '' + 6); //short castles
                        else if (this.whiteLongCastlingRights && this.checkKingRank(piece, -1)) arr.push(piece.row + '' + 2); //long castles
                    }
                    else{
                        if (this.blackShortCastlingRights && this.checkKingRank(piece, 1)) arr.push(piece.row + '' + 6); //short castles
                        else if (this.blackLongCastlingRights && this.checkKingRank(piece, -1)) arr.push(piece.row + '' + 2); //long castles
                    }
                }
                break; 
            case PieceType.pawn:
                if (piece.colourAndPiece() == (PieceType.pawn ^ PieceType.white)){    
                    if (piece.row === 6){  // if white pawn on starting square
                        if (this.occSquares[5][piece.col] === PieceType.none && this.checkNextMoveBitmap(piece, 5,piece.col)) {
                            arr.push(5 + '' + piece.col);
                            if (this.occSquares[4][piece.col] === PieceType.none && this.checkNextMoveBitmap(piece, 4,piece.col)) arr.push(4 + '' + piece.col);
                        }
                    }        
                    else{ //if not on starting square
                        if (this.occSquares[piece.row - 1][piece.col] === PieceType.none && this.checkNextMoveBitmap(piece, piece.row -1, piece.col)){
                            arr.push((piece.row - 1) + '' + piece.col);
                        }
                    }
                    //diagonal capture
                    for (let i = 1; i >= -1 ; i -= 2){ //checks both directions
                        if (this.isOnBoard(piece.row - 1, piece.col + i)){

                            if (this.occSquares[piece.row - 1][piece.col + i] !== 0 && this.checkNextMoveBitmap(piece, piece.row - 1,piece.col + i)){
                                if ((this.occSquares[piece.row - 1][piece.col + i].colour & piece.colour) === 0) arr.push((piece.row - 1) + '' + (piece.col + i));
                            }
                        }
                    }
                
                    if ((this.pawnMovedTwoSquares === true) && (piece.row === 3) && this.checkNextMoveBitmap(piece, piece.row - 1, this.pawnMovedTwoSquaresCol)){
                        arr.push((piece.row - 1) + '' + this.pawnMovedTwoSquaresCol);
                    }
                    
                }
                //
                //black pawns
                //
                else if(piece.colourAndPiece() == (PieceType.pawn ^ PieceType.black)){
                    if (piece.row === 1){  // if white pawn on starting square
                        if (this.occSquares[2][piece.col] === PieceType.none && this.checkNextMoveBitmap(piece, 2, piece.col)){
                            arr.push(2 + '' + piece.col)
                            if (this.occSquares[3][piece.col] == PieceType.none && this.checkNextMoveBitmap(piece, 3, piece.col)){
                                arr.push(3 + '' + piece.col);
                            }
                        }
                    }        
                    else{ //if not on starting square
                        if (this.occSquares[piece.row + 1][piece.col] == PieceType.none && this.checkNextMoveBitmap(piece, piece.row + 1, piece.col)){
                            arr.push((piece.row + 1) + '' + piece.col);
                        }
                    }
                
                    //diagonal capture
                    for (let i = 1; i >= -1 ; i -= 2){
                        if (this.isOnBoard(piece.row + 1, piece.col + i)){
                            if (this.occSquares[piece.row + 1][piece.col + i] !== 0){ 
                                if ((this.occSquares[piece.row + 1][piece.col + i].colour & piece.colour) === 0 && this.checkNextMoveBitmap(piece, piece.row + 1, piece.col + i)){
                                    arr.push((piece.row + 1) + '' + (piece.col + i));
                                }
                            }
                        }
                    }
                
                    if ((this.pawnMovedTwoSquares === true) && (piece.row === 4) && this.checkNextMoveBitmap(piece, piece.row + 1, this.pawnMovedTwoSquaresCol)){
                        arr.push((piece.row + 1) + '' + this.pawnMovedTwoSquaresCol);
                    }
                }
                break;
            default:
                for (let options of piece.intervals()){
                    var col_temp =  piece.col + options.dx;
                    var row_temp = piece.row + options.dy;
   
                    while(this.isOnBoard(row_temp,col_temp)){ //while hasn't gone outside of the array
                        if (this.occSquares[row_temp][col_temp] === 0 && this.checkNextMoveBitmap(piece, row_temp, col_temp)){
                            arr.push(row_temp + '' + col_temp);
                        }
                        else{ //if a piece has been hit
                            if ((this.occSquares[row_temp][col_temp].colour & piece.colour) === 0 && this.checkNextMoveBitmap(piece, row_temp, col_temp)){ // opposite colours
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

    //the PGN requires this when multiple of the same piece can move to the same square
    iterateRowOrCol(piece, target) {
        let col = {0: 'a', 1: 'b', 2: 'c', 3: 'd', 4: 'e', 5: 'f', 6: 'g', 7: 'h'};
        let colIntervals = {"row": 1}
        for (let i = piece.row; i < 8; i++) { //iterate over file
            if (this.isOnBoard(i, piece.col)) {
                if (this.occSquares[i][piece.col] !== 0) {
                    if (this.occSquares[i][piece.col].colourAndPiece() === piece.colourAndPiece()) {
                        let LegalSquares = this.allPiecesLegalSquares(this.occSquares[i][piece.col]);
                        if ((target.row + '' + target.col).includes(LegalSquares)) {
                            return piece.col;
                        }
                    }
                }
            } else break;
        }

    }

    changeTurn(){ // black -> white || white -> black
        this.whiteToMove = !this.whiteToMove;
    }

    checkKingRank(king,dir){ //checks if there are pieces on the way of castling
        for (let i = dir; Math.abs(i) <= 4; i += dir){
            if (this.maskMap[king.row][king.col + i] !== 0){ //if piece has been hit
                if (Math.abs(i) < 2 && this.maskMap[king.row][king.col + i] === 1) {
                    return false;
                }

                //if piece is same colour rook on the 'h' square
                if ((king.col + i === 7) && (this.maskMap[king.row][king.col + i] !== 0)) {
                    return true;

                }
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
        let numKingsFound;
        for (let i = 0; i < 8; i++){
            for (let j = 0; j < 8; j++){
                if (this.occSquares[i][j] !== 0 && this.occSquares[i][j].colourAndPiece() === (PieceType.king ^ PieceType.white)){
                    if (this.maskMap[i][j] === 1) return true; 
                    numKingsFound++;
                    break;
                }
                else if (this.occSquares[i][j] !== 0 && this.occSquares[i][j].colourAndPiece() === (PieceType.king ^ PieceType.black)){
                    if (this.maskMap[i][j] === 1) return true;
                    numKingsFound++;
                    break;
                }
            }
            if (numKingsFound === 2) break;
        }
    }

    findMaskSquares(findAttacksFromWhite, position){ //gets all available squares that the pieces can move to.
        let bitmap = create2dArray(8,8);

        let colourCalc = 16; //if black
        if (findAttacksFromWhite) colourCalc = 8 //if white


        for (var i = 0; i < 8; i++){
            for (var j = 0; j < 8; j++){
                if (position[i][j] !== 0 && ((position[i][j].colour & colourCalc) === colourCalc)){ //if the piece is from the side you want to find attacks from 

                    switch (position[i][j].type){
                        case PieceType.knight: case PieceType.king: case PieceType.pawn:
                            for (let options of position[i][j].intervals()){
                                var col_temp = j + options.dx;
                                var row_temp = i + options.dy;
                    
                                if (this.isOnBoard(row_temp,col_temp)){
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
                
                                while(this.isOnBoard(row_temp,col_temp)){ //while hasn't gone outside of the array
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
        return bitmap;
    }

    maskBitMap(bitmap){
        this.maskMap = create2dArray(8,8);

        for(var i = 0; i < 8; i++){
            for (var j = 0; j < 8; j++){
                if (bitmap[i][j] === 1) this.maskMap[i][j] = 1;
                else if (this.occSquares[i][j] !== 0) this.maskMap[i][j] = this.occSquares[i][j].colour;
            }
        }
    }

    checkNextMoveBitmap(piece, destRow, destCol){ //finds your king and makes sure you don't make a move that puts yourself into check
        let outOfCheck = true;
        let kingRow,kingCol;
        let bitmap;
        let newPosition = this.occSquares.map(arr => arr.slice()); //create copy of occSquares


        if (piece.row === destRow && piece.col === destCol) {
            return false; //a move hasn't actually been made 
        }

        if (newPosition[destRow][destCol] !== 0){
            if (newPosition[destRow][destCol].type === PieceType.king) { //if you haven't captured the king -> update the square
                return false;
            }
        }

        newPosition[piece.row][piece.col] = 0;
        newPosition[destRow][destCol] = piece;
    
        for (let i = 0; i < 8; i++){
            for (let j = 0; j < 8; j++){
                if (newPosition[i][j] !== 0){
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

        //create and mask the bitmap for the new position
        bitmap = this.findMaskSquares(!this.whiteToMove, newPosition);
        this.maskBitMap(bitmap);


        if (this.maskMap[kingRow][kingCol] === 1){ 
            outOfCheck = false; //this is the line that makes it all happen -> disallows pinned pieces and stuff from putting the king in check
        }
        
        return outOfCheck;
    }

    calculateNumLegalMoves(){
        let numLegal = 0;
        let colourCalc = 16; //black
        if (this.whiteToMove) colourCalc = 8; //white

        for (let i = 0; i < 8; i++){
            for (let j = 0; j < 8; j++){
                if (this.occSquares[i][j] !== 0 && ((this.occSquares[i][j].colour & colourCalc) === colourCalc)){ //if colour you want to find number of moves of
                    numLegal += Math.max(this.allPiecesLegalSquares(this.occSquares[i][j]), 0);
                }
            }
        }
        return numLegal;
    }

    isOnBoard(Row,Col){ //is used in legal squares so that it doent iterate outside the board
        if (Row >= 0 && Row < 8 && Col >= 0 && Col < 8){
            return true;
        }
        return false;
    }

    


}

export class PieceType{

    static type = {
        'k': 1, 'p' : 2, 'n' : 3, 'b': 4, 'r': 5, 'q': 6,
        'K': 1, 'P' : 2, 'N' : 3, 'B': 4, 'R': 5, 'Q': 6 
    }
    static numToType = {
        9: 'K', 10: 'P', 11: 'N', 12: 'B', 13: 'R', 14: 'Q',
        17: 'k', 18: 'p', 19: 'n', 20: 'b', 21: 'r', 22: 'q'
    }

    static numToPGNType = { //accounts for the case where a pawn is moved in PGN notation
        9: 'K', 10: '', 11: 'N', 12: 'B', 13: 'R', 14: 'Q',
        17: 'K', 18: '', 19: 'N', 20: 'B', 21: 'R', 22: 'Q'
    }

    static numToPieceName = {
        1: 'king', 2: 'pawn', 3: 'knight', 4: 'bishop', 5: 'rook', 6: 'queen'
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

export class Piece {
    
    constructor(type, row, col, colour){
        this.type = type;
        this.row = row;
        this.col = col;
        this.colour = colour;
    }

    colourAndPiece(){
        return this.colour ^ this.type;
    }

    intervals(){
        switch (this.type) {
            case PieceType.rook:
                return intervalsArr[0];
            case PieceType.king:
                return intervalsArr[3];
            case PieceType.knight:
                return intervalsArr[2];
            case PieceType.bishop:
                return intervalsArr[1];
            case PieceType.queen:
                return intervalsArr[0].concat(intervalsArr[1]);
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

    rowAndCol(){
        return this.row + '' + this.col;
    }

}

