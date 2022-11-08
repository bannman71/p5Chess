var canv;
var canvasDiv;

var WIDTH;
var HEIGHT;


function preload(){
    for (im in BIN_PIECES){
        IMAGES[im] = loadImage('./classic_hq/' + BIN_PIECES[im] + '.png');
    }
}

function setup(){
    document.getElementById("board-editor-container");
    canvasDiv = document.getElementById('board-editor-container');
    WIDTH = canvasDiv.offsetWidth;
    HEIGHT = canvasDiv.offsetHeight;
    
    canv = createCanvas(WIDTH, HEIGHT);
    canv.parent("board-container");

}


function draw(){
    clear();
    background(WHITE);
    draw_grid();

}