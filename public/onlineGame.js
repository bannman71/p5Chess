import Board from './board.mjs';
import { FENToBoard } from './board.mjs';
import { PieceType } from './board.mjs';
import { Piece } from './board.mjs';
import Timer from './timer.mjs';
import Front from './front.mjs';

new p5(function (p5) {
    const socket = io('http://localhost:3000/');

    const queryString = window.location.search;
    const urlParameters = new URLSearchParams(queryString);
    var time = urlParameters.get('time');
    var increment = urlParameters.get('increment');
    roomCode = urlParameters.get('roomCode');


    socket.emit('matchConnect', roomCode);

    var canv;
    var canvasDiv;

    var roomCode;

    var board;
    var front;
    var piece;

    var BLOCK_SIZE;
    var PIECE_SCALE;
    var WIDTH, HEIGHT, SPACING;
    const BIN_PIECES = {
        20: 'b_bishop', 17: 'b_king', 19: 'b_knight', 18: 'b_pawn', 22: 'b_queen', 21: 'b_rook',
        12: 'w_bishop', 9: 'w_king', 11: 'w_knight', 10: 'w_pawn', 14: 'w_queen', 13: 'w_rook'
    }

    let IMAGES = {};


    // let board;
    let bitmap;

    let legalCircles = [];

    let MouseDown;
    let pieceAtMouse;
    let selectedCoords;

    var start = Date.now();
    var blackTime, whiteTime;

    p5.setup = () => {



        canvasDiv = document.getElementById('board-container');
        WIDTH = canvasDiv.offsetWidth;
        HEIGHT = canvasDiv.offsetHeight;

        canv = p5.createCanvas(WIDTH, HEIGHT);
        canv.parent("board-container");

        PIECE_SCALE = 1;

        BLOCK_SIZE = WIDTH / 8;


        blackTime = new Timer(time, increment);
        whiteTime = new Timer(time, increment);


        SPACING = Math.floor((BLOCK_SIZE * (1 - PIECE_SCALE)) / 2);

        board = new Board('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', 0, true,true,true,true,true);

        board.maskBitMap(board.findMaskSquares(!board.whiteToMove, board.occSquares));

        for (let im in BIN_PIECES) {
            IMAGES[im] = p5.loadImage('./classic_hq/' + BIN_PIECES[im] + '.png');
        }

        front = new Front(p5, SPACING, BLOCK_SIZE, PIECE_SCALE, IMAGES);
        //r3k3/1pp2ppp/8/8/1q6/3PKPP1/8/8
        //r3k2r/5N2/8/8/8/8/PPPPPPP1/RNBQKBNR
        //1r1k1r2/6n1/2q5/8/8/5Q2/1N6/R2K3R
        //'rnbqkbnr/1ppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
        //rnbqkbnr/p1pppppp/1p6/4P3/8/5NP1/PPPP1PBP/RNBQK2R
        //'rnbqk1nr/p4ppp/1p1b4/8/8/5NP1/P2K1PBP/RNBQ3R'
    }

    p5.draw = () => {
        p5.clear();
        p5.background(front.white);
        front.draw_grid();
        front.drawAllPieces(board.occSquares, pieceAtMouse);

        if (MouseDown) {
            front.drawPieceAtMousepos(pieceAtMouse, p5.mouseX, p5.mouseY);
            front.drawLegalSquares(legalCircles);
        } 
        
        socket.on('legalMoveMade', (data) => {
            //must create a new board object as it doesn't keep it's methods when being sent over sockets
            board = new Board(FENToBoard(data.FEN, board.moveCounter, board.whiteToMove, board.whiteShort, board.whiteLong, board.blackShort, board.blackLong));
            board.pawnMovedTwoSquares = data.pawnMovedTwoSquares;
            board.pawnMovedTwoSquaresCol = data.pawnMovedTwoSquaresCol;
            board.enPassentTaken = data.enPassentTaken;
            board.isInCheck = data.isInCheck;
            board.castled = data.castled;



            console.log(board);
        });
    }

    //move this into draw function to make the check
    setInterval(() => {
        var delta = Date.now() - start; // milliseconds elapsed since start

        //if move made:
        //  timer -= delta


        //console.log(Math.floor(delta / 1000)); // in seconds
    }, 100);

    p5.mousePressed = () => {
        let tempPieceAtMouse;
        pieceAtMouse = front.getPieceAtMousepos(board.occSquares, p5.mouseX, p5.mouseY); //returns type Piece
        if (pieceAtMouse !== tempPieceAtMouse) legalCircles = []; //empties legalcircles so that it doesn't show the squares when you click on another piece
        tempPieceAtMouse = pieceAtMouse;

        if (pieceAtMouse) {
            selectedCoords = front.getMouseCoord(p5.mouseX, p5.mouseY);

            // var start = performance.now();
            if (board.whiteToMove === (pieceAtMouse.colour === PieceType.white)) {
                legalCircles = board.allPiecesLegalSquares(pieceAtMouse);
            }
            // var end = performance.now();
            // print('time taken ' + (end - start));
            MouseDown = true;

        } else legalCircles = [];
       
    }

    p5.mouseReleased = () => {
        MouseDown = false;
        board.castled = false;
        let isLegal = false;
        let tempEnPassentTaken = false;

        let numDefenses = 0;


        let destCoords = front.getMouseCoord(p5.mouseX, p5.mouseY); // returns coord for array [0,0] [1,1] etc     

        console.log(pieceAtMouse);

        if (board.isOnBoard(destCoords.y, destCoords.x) && pieceAtMouse) {
            var data = { fCoordsX: destCoords.x, fCoordsY: destCoords.y, pieceMoved: pieceAtMouse, colourAndPiece: pieceAtMouse.colourAndPiece(), room: roomCode };
            socket.emit('moveAttempted', data);
            pieceAtMouse = 0;
        }
    }

    p5.windowResized = () => {
        WIDTH = canvasDiv.offsetWidth;
        HEIGHT = canvasDiv.offsetHeight;
        p5.resizeCanvas(WIDTH, HEIGHT);
        BLOCK_SIZE = (WIDTH) / 8; //can be width but it is a square
        SPACING = Math.floor((BLOCK_SIZE * (1 - PIECE_SCALE)) / 2);
    }

   

});