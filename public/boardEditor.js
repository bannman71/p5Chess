var canv;
var canvasDiv;

var WIDTH;
var HEIGHT;

var BLOCK_SIZE;
var SPACING;
var PIECE_SCALE;

let IMAGES = {};


function preload(){
    for (im in BIN_PIECES){
        IMAGES[im] = loadImage('./classic_hq/' + BIN_PIECES[im] + '.png');
    }
}




function setup(){
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


}

function mouseReleased(){

    //if there is a piece at mouse from html

    $("#black-rook").off('click').on("click", function() {
        alert( "Handler for black rook called." );
    });

    $("#black-knight").off('click').on("click", function() {
        alert( "Handler for black knight called." );
    });

    $("#black-bishop").off('click').on("click",function() {
    alert( "Handler for bishop called." );
    });

    $("#black-queen").off('click').on("click",function() {
    alert( "Handler for black queen called." );
    });

    $("#black-king").off('click').on("click",function() {
    alert( "Handler for black king called." );
    });

    $("#black-pawn").off('click').on("click",function() {
    alert( "Handler for black pawn called." );
    });

    $("#white-rook").off('click').on("click",function() {
    alert( "Handler for white rook called." );
    });

    $("#white-knight").off('click').on("click",function() {
    alert( "Handler for white knight called." );
    });

    $("#white-bishop").off('click').on("click",function() {
    alert( "Handler for white bishop called." );
    });

    $("#white-queen").off('click').on("click",function() {
    alert( "Handler for white queen called." );
    });

    $("#white-king").off('click').on("click",function() {
    alert( "Handler for white king called." );
    });

    $("#white-pawn").off('click').on("click",function() {
    alert( "Handler for white pawn called." );
    });


}

function mousePressed(){
    
    
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