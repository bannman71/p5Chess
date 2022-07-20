


function getPieceAtMousepos(x,y){
    x = Math.floor(x / BLOCK_SIZE);
    y = Math.floor(y / BLOCK_SIZE);

    for (let i = 0; i < pieces.length; i++){
        if(pieces[i].row === y && pieces[i].col === x){
            return pieces[i].colourAndPiece();
        }
    }
}

function drawPieceAtMousepos(piece_number, x, y){

    x -= BLOCK_SIZE * PIECE_SCALE / 2  // centers piece
    y -= BLOCK_SIZE * PIECE_SCALE / 2

    image(IMAGES[piece_number], 
    Math.min(height - BLOCK_SIZE + SPACING, Math.max(SPACING, x)), 
    Math.min(height - BLOCK_SIZE + SPACING, Math.max(SPACING, y)), BLOCK_SIZE * PIECE_SCALE, BLOCK_SIZE * PIECE_SCALE);
}

function draw_piece(piece_number,coordX,coordY){
    coordX = SPACING + coordX * BLOCK_SIZE;
    coordY = SPACING + coordY * BLOCK_SIZE;

    image(IMAGES[piece_number],coordX,coordY,BLOCK_SIZE * PIECE_SCALE,BLOCK_SIZE * PIECE_SCALE);
}

function draw_grid(){
    for(let y = 0; y < 8; y++ ){
        for(let x = 0; x < 4; x++){
            fill(BLACK);
            noStroke();
            square((x*2 + ((y+1) % 2)) * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE);
        } 
    }
}

function drawAllPieces(){
    for (let i = 0; i < pieces.length; i++){
        draw_piece(pieces[i].colourAndPiece(), pieces[i].col , pieces[i].row);
    }
}

function FENToBoard(FEN){
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
            occupiedSquares[row][col] = PieceType.black;
            pieces.push(newPiece);
        }
        else if ((/[A-Z]/).test(FEN[FENIterator])){ //if uppercase (white piece)
            var newPiece = new Piece(PieceType.type[FEN[FENIterator]],row,col,PieceType.white);
            occupiedSquares[row][col] = PieceType.white;
            pieces.push(newPiece);
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

function centerCanvas(){
    var x = (windowWidth - width) / 2;
    var y = (windowHeight - height) * 0.25;
    canv.position(x,y);
}