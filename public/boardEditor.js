import Board from './board.mjs';
import Front from './front.mjs';
import {PieceType} from './board.mjs'; 
import { Piece } from './board.mjs';


new p5(function(p5){

    var canv;
    var canvasDiv;

    var WIDTH;
    var HEIGHT;
    var size;

    var BLOCK_SIZE;
    var SPACING;
    var PIECE_SCALE;

    let IMAGES = {};

    var board;
    var front;

    var selectedPiece;

    var getClickedSquare;
    var pieceAtMouse;

    var boardFEN = '8/8/8/8/8/8/8/8';
    var endOfFen;


    const SELECTEDSTYLE = {
        'background-color': 'white',
        'border-radius': '70%', 
        'height': '90%', 
        'width': '90%'
    }

    const DEFSTYLE = {
        'background-color': '#bababa',
        'border-radius': '100%', 
        'height': '100%', 
        'width': '100%'
    }

    const pieces = ['pawn', 'king', 'knight', 'bishop', 'rook', 'queen'];

    const BIN_PIECES = {20: 'b_bishop', 17: 'b_king', 19: 'b_knight', 18: 'b_pawn', 22: 'b_queen', 21: 'b_rook',
    12: 'w_bishop', 9: 'w_king', 11: 'w_knight', 10: 'w_pawn', 14: 'w_queen', 13: 'w_rook'}
    
    function updateCSSFromBoardSize(){
        let whiteSelectionContainerTop = p5.height + $('#black-piece-selection-container').height() + (p5.height * 0.1);
        let whiteSelectionContainerCSS = {
            'position': 'absolute',
            'top': (`%dpx`,whiteSelectionContainerTop)
        };
        $('#white-piece-selection-container').css(whiteSelectionContainerCSS);
    }

    p5.setup = () => {
        for (let im in BIN_PIECES){
            IMAGES[im] = p5.loadImage('./classic_hq/' + BIN_PIECES[im] + '.png');
        }
        board = new Board('8/8/8/8/8/8/8/8');
        canvasDiv = document.getElementById("board-editor-container");
        WIDTH = canvasDiv.offsetWidth;
        HEIGHT = canvasDiv.offsetHeight;

        size = Math.min(WIDTH,HEIGHT);
        
        boardFEN = '8/8/8/8/8/8/8/8';
        $('#FEN-container').html('FEN: ' + boardFEN);

        BLOCK_SIZE = size / 8;

        PIECE_SCALE = 1;
        SPACING = Math.floor((BLOCK_SIZE * (1 - PIECE_SCALE)) / 2);
        
        $(function() { //make piece selection boxes same width as the board
            $("#black-piece-selection-container").width(size);
            $("#white-piece-selection-container").width(size); 
        });

        updateCSSFromBoardSize();  
        
        canv = p5.createCanvas(size, size);
        canv.parent("board-editor-container");

        front = new Front(p5, SPACING, BLOCK_SIZE, PIECE_SCALE, IMAGES);

    }

    p5.draw = () => {
        p5.clear();
        p5.background(front.white);
        front.drawGrid();
        front.drawAllPieces(true, board.occSquares, pieceAtMouse);


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

    setInterval(() => {
        updateCSSFromBoardSize();
    }, 2000);


    p5.mouseReleased = () => {

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

    p5.mousePressed = () => {
        getClickedSquare = front.getMouseCoord(true, p5.mouseX,p5.mouseY);

        if (board.isOnBoard(getClickedSquare.y,getClickedSquare.x)){
            board.occSquares[getClickedSquare.y][getClickedSquare.x] = new Piece((selectedPiece & 7), getClickedSquare.y,getClickedSquare.x, (selectedPiece & 24));
        }


    }


    p5.mouseDragged = () => {

        getClickedSquare = front.getMouseCoord(true, p5.mouseX,p5.mouseY);

        if (board.isOnBoard(getClickedSquare.y,getClickedSquare.x)){
            board.occSquares[getClickedSquare.y][getClickedSquare.x] = new Piece((selectedPiece & 7), getClickedSquare.y,getClickedSquare.x, (selectedPiece & 24));
        }

    }

    p5.windowResized = () => {
        WIDTH = canvasDiv.offsetWidth;
        HEIGHT = canvasDiv.offsetHeight;

        size = Math.min(WIDTH,HEIGHT);
        $("#black-piece-selection-container").width(size);
        $("#white-piece-selection-container").width(size);

        updateCSSFromBoardSize();

        front.blockSize = (size) / 8; //can be width but it is a square
        front.spacing = Math.floor((front.blockSize * (1 - front.pieceScale)) / 2);
        p5.resizeCanvas(size, size);
        
    }
});