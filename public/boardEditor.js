var canv;
var canvasDiv;

var WIDTH;
var HEIGHT;

var BLOCK_SIZE;
var SPACING;
var PIECE_SCALE;

let IMAGES = {};

var board;

var selectedPiece;

var getClickedSquare;
var pieceAtMouse;


function preload(){
    for (im in BIN_PIECES){
        IMAGES[im] = loadImage('./classic_hq/' + BIN_PIECES[im] + '.png');
    }
}




function setup(){

    board = new Board('8/8/8/8/8/8/8/8');
    canvasDiv = document.getElementById("board-editor-container");
    WIDTH = canvasDiv.offsetWidth;
    HEIGHT = canvasDiv.offsetHeight;

    var size = Math.min(WIDTH,HEIGHT);
    

    BLOCK_SIZE = size / 8;

    PIECE_SCALE = 0.75;
    SPACING = Math.floor((BLOCK_SIZE * (1 - PIECE_SCALE)) / 2);
    
    $(function() { //make piece selection boxes same width as the board
        $("#black-piece-selection-container").width(size);
        $("#white-piece-selection-container").width(size); 
    });
    
    canv = createCanvas(size, size);
    canv.parent("board-editor-container");

}

function draw(){
    clear();
    background(WHITE);
    draw_grid();
    drawAllPieces(board.occSquares, pieceAtMouse);

}

function mouseReleased(){

    //if there is a piece at mouse from html

    $("#black-rook").off('click').on("click", function() {
        selectedPiece = PieceType.rook ^ PieceType.black;
        // alert( "Handler for black rook called." );
    });

    $("#black-knight").off('click').on("click", function() {
        selectedPiece = PieceType.knight ^ PieceType.black; 
        // alert( "Handler for black knight called." );
    });

    $("#black-bishop").off('click').on("click",function() {
        selectedPiece = PieceType.bishop ^ PieceType.black;
        // alert( "Handler for bishop called." );
    });

    $("#black-queen").off('click').on("click",function() {
        selectedPiece = PieceType.queen ^ PieceType.black;
        // alert( "Handler for black queen called." );
    });

    $("#black-king").off('click').on("click",function() {
        selectedPiece = PieceType.king ^ PieceType.black;
        // alert( "Handler for black king called." );
    });

    $("#black-pawn").off('click').on("click",function() {
        selectedPiece = PieceType.pawn ^ PieceType.black;
        // alert( "Handler for black pawn called." );
    });

    $("#white-rook").off('click').on("click",function() {
        selectedPiece = PieceType.rook ^ PieceType.white;
        // alert( "Handler for white rook called." );
    });

    $("#white-knight").off('click').on("click",function() {

        selectedPiece = PieceType.knight ^ PieceType.white;
        // alert( "Handler for white knight called." );
    });

    $("#white-bishop").off('click').on("click",function() {
        selectedPiece = PieceType.bishop ^ PieceType.white;
        // alert( "Handler for white bishop called." );
    });

    $("#white-queen").off('click').on("click",function() {
        selectedPiece = PieceType.queen ^ PieceType.white;
        // alert( "Handler for white queen called." );
    });

    $("#white-king").off('click').on("click",function() {
        selectedPiece = PieceType.king ^ PieceType.white;
        // alert( "Handler for white king called." );
    });

    $("#white-pawn").off('click').on("click",function() {
        selectedPiece = PieceType.pawn ^ PieceType.white;
        // alert( "Handler for white pawn called." );
    });

    if (isOnBoard(getClickedSquare.y,getClickedSquare.x)){
        board.occSquares[getClickedSquare.y][getClickedSquare.x] = new Piece((selectedPiece & 7), getClickedSquare.y,getClickedSquare.x, (selectedPiece & 24));
    }

    switch (selectedPiece){
        case PieceType.black ^ PieceType.pawn:
            console.log('yooo');
            $("#b-pawn-square").css("background-color", "#F0F0F0", "border-radius", "50%");
        case PieceType.black ^ PieceType.pawn:
        case PieceType.black ^ PieceType.pawn:
        case PieceType.black ^ PieceType.pawn:
        case PieceType.black ^ PieceType.pawn:  
        case PieceType.black ^ PieceType.pawn:
        
    }


}

function mousePressed(){
    getClickedSquare = getMouseCoord(mouseX,mouseY);
    
}

function windowResized(){
    WIDTH = canvasDiv.offsetWidth;
    HEIGHT = canvasDiv.offsetHeight;

    size = Math.min(WIDTH,HEIGHT);
    $("#black-piece-selection-container").width(size);
    $("#white-piece-selection-container").width(size);
    resizeCanvas(size, size);
    BLOCK_SIZE = (size) / 8; //can be width but it is a square
    SPACING = Math.floor((BLOCK_SIZE * (1 - PIECE_SCALE)) / 2);
}