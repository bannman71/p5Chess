var canv;
var canvasDiv;

var BLOCK_SIZE;
var PIECE_SCALE;
var PIECE_SCALE;


let IMAGES = {};

let board;
let bitmap;

let legalCircles = [];

let MouseDown;
let pieceAtMouse;
let selectedCoords;

var start = Date.now();
var blackTime, whiteTime;



function preload(){
    for (im in BIN_PIECES){
        IMAGES[im] = loadImage('./classic_hq/' + BIN_PIECES[im] + '.png');
    }
}

function setup() {
    canvasDiv = document.getElementById('board-container');
    WIDTH = canvasDiv.offsetWidth;
    HEIGHT = canvasDiv.offsetHeight;
    
    canv = createCanvas(WIDTH, HEIGHT);
    canv.parent("board-container");

    PIECE_SCALE = 1;

    BLOCK_SIZE = WIDTH / 8;

    const queryString = window.location.search;
    const urlParameters = new URLSearchParams(queryString);
    var time = urlParameters.get('time');
    var increment = urlParameters.get('increment');

    blackTime = new Timer(time, increment);
    whiteTime = new Timer(time, increment);


    SPACING = Math.floor((BLOCK_SIZE * (1 - PIECE_SCALE)) / 2);

    board = new Board('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');

    board.maskBitMap(board.findMaskSquares(!board.whiteToMove, board.occSquares));

    //r3k3/1pp2ppp/8/8/1q6/3PKPP1/8/8
    //r3k2r/5N2/8/8/8/8/PPPPPPP1/RNBQKBNR
    //1r1k1r2/6n1/2q5/8/8/5Q2/1N6/R2K3R
    //'rnbqkbnr/1ppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
    //rnbqkbnr/p1pppppp/1p6/4P3/8/5NP1/PPPP1PBP/RNBQK2R
    //'rnbqk1nr/p4ppp/1p1b4/8/8/5NP1/P2K1PBP/RNBQ3R'
} 

function draw() {
    clear();
    background(WHITE);
    draw_grid();
    drawAllPieces(board.occSquares, pieceAtMouse);

    if (MouseDown){
        drawPieceAtMousepos(pieceAtMouse,mouseX,mouseY);
        drawLegalSquares(legalCircles);
    }



}

//move this into draw function to make the check
setInterval(() => {
    var delta = Date.now() - start; // milliseconds elapsed since start
    
    //if move made:
    //  timer -= delta


    //console.log(Math.floor(delta / 1000)); // in seconds
}, 100);

function mousePressed(){
    let tempPieceAtMouse;
    pieceAtMouse = getPieceAtMousepos(board.occSquares,mouseX,mouseY); //returns type Piece
    if (pieceAtMouse !== tempPieceAtMouse) legalCircles = []; //empties legalcircles so that it doesn't show the squares when you click on another piece
    tempPieceAtMouse = pieceAtMouse;
    
    if (pieceAtMouse){
        selectedCoords = getMouseCoord(mouseX, mouseY);

        var start = performance.now();
        if (board.whiteToMove === (pieceAtMouse.colour === PieceType.white)){
            legalCircles = board.allPiecesLegalSquares(pieceAtMouse);
        }
        var end = performance.now();
        print('time taken ' + (end - start));
        MouseDown = true;
        
    }else legalCircles = [];
 
}

function mouseReleased(){
    MouseDown = false;
    board.castled = false;
    let isLegal = false;
    let tempEnPassentTaken = false;

    let numDefenses = 0;


    let destCoords = getMouseCoord(mouseX,mouseY); // returns coord for array [0,0] [1,1] etc     


    if (isOnBoard(destCoords.y, destCoords.x) && pieceAtMouse){

        

        tempEnPassentTaken = board.enPassentTaken;

        if (pieceAtMouse.type === PieceType.king){
            if(board.checkNextMoveBitmap(pieceAtMouse,destCoords.y,destCoords.x) === true){ //king moves need the bitmap before due to castling through a check
                if (board.isLegalKingMove(pieceAtMouse,destCoords.y,destCoords.x)) isLegal = true;
            }
        } else {
            if (board.isLegalMove(pieceAtMouse,destCoords.y,destCoords.x)){ //doesn't need the bitmap first as it can find after a move has been made whether or not it is in check
                if (board.checkNextMoveBitmap(pieceAtMouse,destCoords.y,destCoords.x) === true) isLegal = true;
            }
        }


        if (isLegal){
            print('here');
            if (tempEnPassentTaken === true) {
                board.enPassentTaken = false;
            }

            board.defendCheck();

            if (pieceAtMouse.type !== PieceType.pawn) board.pawnMovedTwoSquares = false;
            //is set to false here and in board.isLegalMove


            if (pieceAtMouse.colour === PieceType.black) board.moveCounter++; //after blacks move -> the move counter always increases

            
            if (board.enPassentTaken){
                board.updateEnPassentMove(pieceAtMouse,destCoords.y,destCoords.x);
            }
            else{
                if (!board.castled) board.updatePiecePos(pieceAtMouse,destCoords.y,destCoords.x); //castling changes position inside the castles function
            }
        
            let bmap = board.findMaskSquares(board.whiteToMove, board.occSquares);
            board.maskBitMap(bmap); //create a new bitmap for the current legal position for board.kingInCheck()

            if (board.kingInCheck()){
                board.isInCheck = true;
                
                numDefenses = board.defendCheck();

            } else board.isInCheck = false;

            board.changeTurn();

        }

        if (board.kingInCheck()){
            board.isInCheck = true;
            numDefenses = board.defendCheck();
        } else board.isInCheck = false;

        if (board.isInCheck && numDefenses === 0){
            if (board.whiteToMove){
                print('black wins');
            } else print('white wins');
        }
        else if (board.calculateNumLegalMoves() === 0) print('stalemate');
        pieceAtMouse = 0;
    }   
}

function windowResized(){
    WIDTH = canvasDiv.offsetWidth;
    HEIGHT = canvasDiv.offsetHeight;
    resizeCanvas(WIDTH, HEIGHT);
    BLOCK_SIZE = (WIDTH) / 8; //can be width but it is a square
    SPACING = Math.floor((BLOCK_SIZE * (1 - PIECE_SCALE)) / 2);
}

