var canv;
const BLACK = 'rgb(140,162,173)';
const WHITE = 'rgb(222,237,230)';

let IMAGES = {};

let board;
let bitmap;

let MouseDown;
let pieceAtMouse;

let BIN_PIECES = {
    20: 'b_bishop', 17: 'b_king', 19: 'b_knight', 18: 'b_pawn', 22: 'b_queen', 21: 'b_rook',
    12: 'w_bishop', 9: 'w_king', 11: 'w_knight', 10: 'w_pawn', 14: 'w_queen', 13: 'w_rook'
}

function preload(){
    for (im in BIN_PIECES){
        IMAGES[im] = loadImage('./classic_hq/' + BIN_PIECES[im] + '.png');
    }
}

function setup() {
    canv = createCanvas(windowHeight * 0.8, windowHeight * 0.8);

    PIECE_SCALE = 0.75;
    BLOCK_SIZE = (windowHeight * 0.8) / 8; //can be width but it is a square
    SPACING = Math.floor((BLOCK_SIZE * (1 - PIECE_SCALE)) / 2);
    
    board = new Board('1r2kr2/6n1/2q5/8/8/5Q2/1N6/R3K2R');
    //r3k2r/5N2/8/8/8/8/PPPPPPP1/RNBQKBNR
    //1r1k1r2/6n1/2q5/8/8/5Q2/1N6/R2K3R
    //'rnbqkbnr/1ppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
    centerCanvas();
} 

function draw() {
    background(WHITE);
    draw_grid();
    drawAllPieces(board.avPieces);

    if (MouseDown){
        drawPieceAtMousepos(pieceAtMouse,mouseX,mouseY);
    }

}

function mousePressed(){
  
    pieceAtMouse = getPieceAtMousepos(board.avPieces,mouseX,mouseY); //returns type Piece
    MouseDown = true;
    
}

function mouseReleased(){
    MouseDown = false;

    if (pieceAtMouse !== 0){
        let destCoords = getMouseCoord(mouseX,mouseY); // returns coord for array [0,0] [1,1] etc.

        bitmap = board.findMaskSquares();
        board.maskBitMap(bitmap);

        if(board.isLegalMove(pieceAtMouse,destCoords.y,destCoords.x)){
            
            // bitmap = board.generateBitMap();
            // board.maskBitMap(bitmap);
            
            print(board.maskMap);

            if (pieceAtMouse.colour === PieceType.black) board.moveCounter++;
            board.changeTurn();
            
            if (!(pieceAtMouse.PieceType === PieceType.king)) board.updatePiecePos(pieceAtMouse,destCoords.y,destCoords.x); //king updates its position internally
            
        } //x and y are flipped as y is the equivalent to row
          
    }   
}

function windowResized(){
    resizeCanvas(windowHeight * 0.8, windowHeight * 0.8);
    centerCanvas();
    BLOCK_SIZE = (windowHeight * 0.8) / 8; //can be width but it is a square
    SPACING = Math.floor((BLOCK_SIZE * (1 - PIECE_SCALE)) / 2);
}

