import Board from './board.mjs';
import { FENToBoard } from './board.mjs';
import { PieceType } from './board.mjs';
import { Piece } from './board.mjs';
import Timer from './timer.mjs';
import Front from './front.mjs';

new p5(function (p5) {
    const socket = io('https://bannman71-p5chess-674rjrqr9vxh4grq-3000.preview.app.github.dev');
    // const socket = io('http://localhost:3000');

    const queryString = window.location.search;
    const urlParameters = new URLSearchParams(queryString);
    var time = urlParameters.get('time');
    var increment = urlParameters.get('increment');
    roomCode = urlParameters.get('roomCode');


    socket.emit('matchConnect', roomCode);

    var roomCode;
    var clientIsWhite;
    
    socket.on('gameColour', (isWhite) => {
        clientIsWhite = isWhite;
    });


    var canv;
    var canvasDiv;

   

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

    //SERVER SIDE LOGIC

    socket.on('legalMoveMade', (data) => {
        //must create a new board object as it doesn't keep it's methods when being sent over sockets
        board = new Board(data.FEN);
        board.moveCounter = data.board.moveCounter + 1;
        board.whiteToMove = data.board.whiteToMove;
        board.blackShortCastlingRights = data.board.blackShortCastlingRights;
        board.blackLongCastlingRights = data.board.blackLongCastlingRights;
        board.whiteShortCastlingRights = data.board.whiteShortCastlingRights;
        board.whiteLongCastlingRights = data.board.whiteLongCastlingRights;

        board.pawnMovedTwoSquares = data.board.pawnMovedTwoSquares;
        board.pawnMovedTwoSquaresCol = data.board.pawnMovedTwoSquaresCol;
        board.enPassentTaken = data.board.enPassentTaken;
        board.isInCheck = data.board.isInCheck;
        board.castled = data.board.castled;

        console.log(board);

    });

    p5.setup = () => {
        canvasDiv = document.getElementById('board-container');
        WIDTH = canvasDiv.offsetWidth;
        HEIGHT = canvasDiv.offsetHeight;

        canv = p5.createCanvas(WIDTH, HEIGHT);
        canv.parent("board-container");

        PIECE_SCALE = 1;

        BLOCK_SIZE = WIDTH / 8;

        console.log('white or not');
        console.log(clientIsWhite);

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
        front.drawGrid();
        front.drawAllPieces(clientIsWhite, board.occSquares, pieceAtMouse); 
        if (MouseDown) {
            front.drawPieceAtMousepos(pieceAtMouse, p5.mouseX, p5.mouseY);
            front.drawLegalSquares(clientIsWhite, legalCircles);
        } 
        else pieceAtMouse = 0; 
    }

    //move this into draw function to make the check
    setInterval(() => {
        var delta = Date.now() - start; // milliseconds elapsed since start

        //if move made:
        //  timer -= delta

        //console.log(Math.floor(delta / 1000)); // in seconds
    }, 1000);

    p5.mousePressed = () => {
        let tempPieceAtMouse;
        pieceAtMouse = front.getPieceAtMousepos(clientIsWhite, board.occSquares, p5.mouseX, p5.mouseY); //returns type Piece
        if (pieceAtMouse !== tempPieceAtMouse) legalCircles = []; //empties legalcircles so that it doesn't show the squares when you click on another piece
        tempPieceAtMouse = pieceAtMouse;

        if (pieceAtMouse) {
          

            // var start = performance.now();
            if (board.whiteToMove && (pieceAtMouse.colour === PieceType.white) && clientIsWhite) {
                legalCircles = board.allPiecesLegalSquares(pieceAtMouse);
            }
            else if (!board.whiteToMove && (pieceAtMouse.colour === PieceType.black) && !clientIsWhite){
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
        let legalSideAttemptedMove = false;
        let isLegal = false;


        if (clientIsWhite === (pieceAtMouse.colour === PieceType.white)) legalSideAttemptedMove = true;

        let destCoords = front.getMouseCoord(clientIsWhite, p5.mouseX, p5.mouseY); // returns coord for array         
        
        if (board.isOnBoard(destCoords.y, destCoords.x) && pieceAtMouse && legalSideAttemptedMove) {

            var data = { fCoordsX: destCoords.x, fCoordsY: destCoords.y, pieceMoved: pieceAtMouse, colourAndPiece: pieceAtMouse.colourAndPiece(), room: roomCode };

             if (pieceAtMouse.type === PieceType.king){
                //king moves need the bitmap before due to castling through a check
                if(board.checkNextMoveBitmap(pieceAtMouse, destCoords.y, destCoords.y) === true){  
                    if (board.isLegalKingMove(pieceAtMouse, destCoords.y, destCoords.x)){
                        isLegal = true;
                        socket.emit('moveAttempted', data);
                    }
                }
            } else {
                if (board.isLegalMove(pieceAtMouse, destCoords.y, destCoords.x)){ 
                    //doesn't need the bitmap first as it can find after a move has been made whether or not it is in check
                    if (board.checkNextMoveBitmap(pieceAtMouse, destCoords.y, destCoords.x) === true) {
                        isLegal = true;
                        socket.emit('moveAttempted', data);
                    }
                }
            }
        }

        if (isLegal){

            console.log('legal');
          
            if (board.enPassentTaken){
                board.updateEnPassentMove(pieceAtMouse, destCoords.y, destCoords.x);
            }
            else{
                //if they didn't castle -> call the function which makes a normal move
                if (!board.castled) board.updatePiecePos(pieceAtMouse, destCoords.y, destCoords.x); //castling changes position inside the castles function
            }
            //create a new bitmap for the current legal position for board.kingInCheck()
            let bmap = board.findMaskSquares(board.whiteToMove, board.occSquares);
            board.maskBitMap(bmap); 

            if (board.kingInCheck()){
                board.isInCheck = true;
                numDefenses = board.defendCheck();

            } else board.isInCheck = false;
            
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