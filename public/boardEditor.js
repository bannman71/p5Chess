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
    
    $(function() {
        $("#black-piece-selection-container").width(size);
    });
    canv = createCanvas(size, size);
    canv.parent("board-editor-container");

}

function mouseReleased(){

    //if there is a piece at mouse from html


}


function draw(){
    clear();
    background(WHITE);
    draw_grid();


}

function windowResized(){

    WIDTH = canvasDiv.offsetWidth;
    HEIGHT = canvasDiv.offsetHeight;

    size = Math.min(WIDTH,HEIGHT);
    $("#black-piece-selection-container").width(size);
    resizeCanvas(size, size);
    BLOCK_SIZE = (size) / 8; //can be width but it is a square
    SPACING = Math.floor((BLOCK_SIZE * (1 - PIECE_SCALE)) / 2);
}