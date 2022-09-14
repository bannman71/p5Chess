var canv;
const BLACK = 'rgb(140,162,173)';
const WHITE = 'rgb(222,237,230)';

let IMAGES = {};

let board;
let bitmap;

let legalCircles;
let blockableSquares;
let piecestoDefendCheck;

let MouseDown;
let pieceAtMouse;
let selectedCoords;

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
    
    board = new Board('rnbqk1nr/p4ppp/1p1b4/8/8/5NP1/P2K1PBP/RNBQ3R');
    //r3k2r/5N2/8/8/8/8/PPPPPPP1/RNBQKBNR
    //1r1k1r2/6n1/2q5/8/8/5Q2/1N6/R2K3R
    //'rnbqkbnr/1ppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
    //rnbqkbnr/p1pppppp/1p6/4P3/8/5NP1/PPPP1PBP/RNBQK2R
    centerCanvas();
} 

function draw() {
    clear();
    background(WHITE);
    draw_grid();
    drawAllPieces(board.avPieces,pieceAtMouse);

    /*if (board.isInCheck){
        drawBlockableSquares(blockableSquares);
    }
    */
    if (MouseDown){
        drawPieceAtMousepos(pieceAtMouse,mouseX,mouseY);
        
        if (board.isInCheck){
            drawInCheckLegalSquares(piecestoDefendCheck,selectedCoords.x,selectedCoords.y);
        } else drawLegalSquares(legalCircles);
    }

}

function mousePressed(){
    pieceAtMouse = getPieceAtMousepos(board.avPieces,mouseX,mouseY); //returns type Piece
    Coords.x = mouseX;
    Coords.y = mouseY;
    selectedCoords = Coords;
    if (pieceAtMouse !== 0){
        if ((board.whiteToMove && (pieceAtMouse.colour === PieceType.white)) || !board.whiteToMove && (pieceAtMouse.colour === PieceType.black)){
            print('in');
            legalCircles = board.allPiecesLegalSquares(pieceAtMouse);
        }
        MouseDown = true;
        
    }else legalCircles = [];
    //print(legalCircles);
 
}

function mouseReleased(){
    MouseDown = false;
    board.castled = false;
    let isLegal = false;
    let tempEnPassentTaken = false;


    if (pieceAtMouse !== 0){
        let destCoords = getMouseCoord(mouseX,mouseY); // returns coord for array [0,0] [1,1] etc     

        tempEnPassentTaken = board.enPassentTaken;

        if (pieceAtMouse.type === PieceType.king){
            if(board.checkNextMoveBitmap(pieceAtMouse,board.avPieces,destCoords.y,destCoords.x) === true){ //king moves need the bitmap before due to castling through a check
                print('king ok');
                if (board.isLegalKingMove(pieceAtMouse,destCoords.y,destCoords.x)) isLegal = true;
            }
        } else {
            if (board.isLegalMove(pieceAtMouse,destCoords.y,destCoords.x)){ //doesn't need the bitmap first as it can find after a move has been made whether or not it is in check
                if (board.checkNextMoveBitmap(pieceAtMouse,board.avPieces,destCoords.y,destCoords.x) === true) isLegal = true;
            }
        }


        if (isLegal){

            if (tempEnPassentTaken === true) {
                board.enPassentTaken = false;
            }


            if (pieceAtMouse.colour === PieceType.black) board.moveCounter++;

            if (!(pieceAtMouse.type === PieceType.pawn)) board.pawnMovedTwoSquares = false; //variable is set to false inside legal moves function and here
            if (board.enPassentTaken){
                board.updateEnPassentMove(pieceAtMouse,destCoords.y,destCoords.x);
            }
            else{
                if (!board.castles) board.updatePiecePos(pieceAtMouse,destCoords.y,destCoords.x); //castling changes position inside the castles function
            }
        
            
            let piecesToFind = board.findColouredPieces(board.whiteToMove, board.avPieces);
            let bmap = board.findMaskSquares(piecesToFind, board.occSquares);
            board.maskBitMap(bmap);
            print('down');
            print(bmap);
            if (board.kingInCheck()){
                print('check');
                board.isInCheck = true;
                let piecesToBlock = board.findColouredPieces(!board.whiteToMove,board.avPieces)
                blockableSquares = board.findBlockableSquares(piecesToBlock);
                print('hello');
                print(blockableSquares);

                piecestoDefendCheck = board.defendCheck(blockableSquares);
                
            } else board.isInCheck = false;


            board.changeTurn();

            //creates a bitmap for pieces attacking the player to move's king
            //if white just moved -> this would check which white pieces are attacking black
            //this is so that we can see if the board is in check after each move and so that we can find the pieces which can block the attack
            
            
        }
        print(board.isInCheck);
        if (board.isInCheck && piecestoDefendCheck === 0){
            if (board.whiteToMove){
                print('black wins');
            } else print('white wins');
        }
        pieceAtMouse = 0;
    }   
}

function windowResized(){
    resizeCanvas(windowHeight * 0.8, windowHeight * 0.8);
    centerCanvas();
    BLOCK_SIZE = (windowHeight * 0.8) / 8; //can be width but it is a square
    SPACING = Math.floor((BLOCK_SIZE * (1 - PIECE_SCALE)) / 2);
}

