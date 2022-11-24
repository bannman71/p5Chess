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

var boardFEN = '8/8/8/8/8/8/8/8';
var endOfFen;


const SELECTEDSTYLE = {
    'background-color': 'transparent',
    'border-radius': '70%', 
    'height': '90%', 
    'width': '90%'
}

const DEFSTYLE = {
    'background-color': '#bababa',
    'border-radius': '0%', 
    'height': '100%', 
    'width': '100%'
}

const pieces = ['pawn', 'king', 'knight', 'bishop', 'rook', 'queen'];

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
    
    boardFEN = '8/8/8/8/8/8/8/8';
    $('#FEN-container').html('FEN: ' + boardFEN);

    BLOCK_SIZE = size / 8;

    PIECE_SCALE = 1;
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


    let whitePieceToSelect;
    let blackPieceToSelect;
    //highlights the piece that has been selected to place on the board
    for (var piece of pieces){
        whitePieceToSelect = '#w-' + piece + '-square';
        blackPieceToSelect = '#b-' + piece + '-square'; 

        $(blackPieceToSelect).css(DEFSTYLE);
        $(whitePieceToSelect).css(DEFSTYLE);

        if ((selectedPiece & 24) === PieceType.black){
            if (PieceType.numToPieceName[selectedPiece & 7] === piece){
                $(blackPieceToSelect).css(SELECTEDSTYLE);
            }
        }else {
            if (PieceType.numToPieceName[selectedPiece & 7] === piece){
                $(whitePieceToSelect).css(SELECTEDSTYLE);
            }
        }
    }


    endOfFen = '';
    if ($('#white-to-move').is(':checked')) endOfFen += ' w '; else endOfFen += ' b ';
    if ($('#white-castling-short').is(':checked')) endOfFen += 'K';
    if ($('#white-castling-long').is(':checked')) endOfFen += 'Q';
    if ($('#black-castling-short').is(':checked')) endOfFen += 'k';
    if ($('#black-castling-long').is(':checked')) endOfFen += 'q';

    $('#FEN-container').html(boardFEN + endOfFen + ' - 0 1');


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

   

    boardFEN = board.boardToFEN();


}

function mousePressed(){
    
}

function mouseDragged(){

    getClickedSquare = getMouseCoord(mouseX,mouseY);

    if (isOnBoard(getClickedSquare.y,getClickedSquare.x)){
        board.occSquares[getClickedSquare.y][getClickedSquare.x] = new Piece((selectedPiece & 7), getClickedSquare.y,getClickedSquare.x, (selectedPiece & 24));
    }

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