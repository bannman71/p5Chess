var canv;
const BLACK = 'rgb(140,162,173)';
const WHITE = 'rgb(222,237,230)';

let IMAGES = {};

let board;
let bitmap;

let legalCircles = [];
let blockableSquares;
let piecestoDefendCheck;
let pinnedPiece = [];

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
    
    board = new Board('r1b2b2/8/2kq4/8/2B5/5K2/8/2BQ4');
    //r3k2r/5N2/8/8/8/8/PPPPPPP1/RNBQKBNR
    //1r1k1r2/6n1/2q5/8/8/5Q2/1N6/R2K3R
    //'rnbqkbnr/1ppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
    //rnbqkbnr/p1pppppp/1p6/4P3/8/5NP1/PPPP1PBP/RNBQK2R
    //'rnbqk1nr/p4ppp/1p1b4/8/8/5NP1/P2K1PBP/RNBQ3R'
    centerCanvas();
} 

function draw() {
    clear();
    background(WHITE);
    draw_grid();
    drawAllPieces(board.occSquares,pieceAtMouse);

    if (board.isInCheck){
        drawBlockableSquares(blockableSquares);
    }

    if (MouseDown){
        print('dwn');
        drawPieceAtMousepos(pieceAtMouse,mouseX,mouseY);
        
        if (board.isInCheck){
            drawInCheckLegalSquares(piecestoDefendCheck,selectedCoords.x,selectedCoords.y);
        } else{
            drawLegalSquares(legalCircles);
        }
    }

}

function mousePressed(){
    let tempPieceAtMouse;
    let clickedPinnedPiece = false;
    pieceAtMouse = getPieceAtMousepos(board.occSquares,mouseX,mouseY); //returns type Piece
    if (pieceAtMouse !== tempPieceAtMouse) legalCircles = []; //empties legalcircles so that it doesn't show the squares when you click on another piece
    tempPieceAtMouse = pieceAtMouse;
    
    
 
    if (pieceAtMouse !== 0){
        selectedCoords = getMouseCoord(mouseX, mouseY);


        print(pinnedPiece.length);

        if ((board.whiteToMove && (pieceAtMouse.colour === PieceType.white)) || (!board.whiteToMove && (pieceAtMouse.colour === PieceType.black))){


            if (pinnedPiece.length === 0) legalCircles = board.allPiecesLegalSquares(pieceAtMouse);
            else {
                for (let i = 0; i < pinnedPiece.length; i++){
                    if (pinnedPiece[i].piece === pieceAtMouse) {
                        legalCircles = pinnedPiece[i].pinnedLegalSquares;
                        clickedPinnedPiece = true;
                    }
                }
                if (!clickedPinnedPiece) legalCircles = board.allPiecesLegalSquares(pieceAtMouse);
            }
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
            if(board.checkNextMoveBitmap(pieceAtMouse,destCoords.y,destCoords.x) === true){ //king moves need the bitmap before due to castling through a check
                print('king can go there');
                if (board.isLegalKingMove(pieceAtMouse,destCoords.y,destCoords.x)) isLegal = true;
            }
        } else {
            if (board.isLegalMove(pieceAtMouse,destCoords.y,destCoords.x)){ //doesn't need the bitmap first as it can find after a move has been made whether or not it is in check
                print('thats legal');
                if (board.checkNextMoveBitmap(pieceAtMouse,destCoords.y,destCoords.x) === true) isLegal = true;
            }
        }


        if (isLegal){
            print('here');
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
        
            
            //let piecesToFind = board.findColouredPieces(board.whiteToMove, board.avPieces, board.occSquares);
            let bmap = board.findMaskSquares(board.whiteToMove, board.occSquares);
            board.maskBitMap(bmap); //create a new bitmap for the current legal position 

            pinnedPiece = board.findPinnedPieceSquares();
            print('pinned');
            print(pinnedPiece);

            if (board.kingInCheck()){
                print('check');
                board.isInCheck = true;
                
                blockableSquares = board.findBlockableSquares();
               
                piecestoDefendCheck = board.defendCheck(blockableSquares);
                

            } else board.isInCheck = false;


            board.changeTurn();

           
            
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

