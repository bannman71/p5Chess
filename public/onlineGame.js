import Board from './board.mjs';
import { FENToBoard } from './board.mjs';
import { PieceType } from './board.mjs';
import { Piece } from './board.mjs';
import { instantiateNewBoard } from './board.mjs';
import Timer from './timer.mjs';
import Front from './front.mjs';

new p5(function (p5) {
    // const socket = io('https://bannman71-p5chess-674rjrqr9vxh4grq-3000.preview.app.github.dev');
    const socket = io('http://localhost:3000');

    const queryString = window.location.search;
    const urlParameters = new URLSearchParams(queryString);
    var time = urlParameters.get('time');
    var increment = urlParameters.get('increment');
    var clientIsWhite = urlParameters.get('isWhite');

    if (clientIsWhite === '0') {
        clientIsWhite = false;
    }else clientIsWhite = true;

    var roomCode = urlParameters.get('roomCode');


    socket.emit('matchConnect', roomCode);

    var blackTime, whiteTime;

    var canv;
    var canvasDiv;

    var board;
    var front;
    var size;

    var BLOCK_SIZE;
    var PIECE_SCALE;
    var WIDTH, HEIGHT, SPACING;
    const BIN_PIECES = {
        20: 'b_bishop', 17: 'b_king', 19: 'b_knight', 18: 'b_pawn', 22: 'b_queen', 21: 'b_rook',
        12: 'w_bishop', 9: 'w_king', 11: 'w_knight', 10: 'w_pawn', 14: 'w_queen', 13: 'w_rook'
    }

    let IMAGES = {};

    let bitmap;

    let legalCircles = [];

    let MouseDown;
    let pieceAtMouse;
    let selectedCoords;

    var timeMoveStart = 0;
    var timeMoveEnd = 0;


    //SERVER SIDE LOGIC

    socket.on('legalMoveMade', (data) => {
        //must create a new board object as it doesn't keep it's methods when being sent over sockets
        //is called when the opponent makes a legal move

        console.log('in here');

        board = instantiateNewBoard(data.board, data.FEN)
        timeMoveStart = Date.now();

    });

    function updateCSSFromBoardSize() {
        let boardWidth = $('#online-board-container').width();
        let gameInfoCSS = {
            'position': 'absolute',
            'left': ('%d', boardWidth),
            'top': '6%'
        };

        $('#online-game-info').css(gameInfoCSS);
    }

    p5.setup = () => {
        canvasDiv = document.getElementById('online-board-container');
        WIDTH = canvasDiv.offsetWidth;
        HEIGHT = canvasDiv.offsetHeight;
        size = Math.min(WIDTH, HEIGHT);

        canv = p5.createCanvas(size, size);
        canv.parent("online-board-container");

        PIECE_SCALE = 1;

        BLOCK_SIZE = size / 8;

        console.log('white or not');
        console.log(clientIsWhite);

        SPACING = Math.floor((BLOCK_SIZE * (1 - PIECE_SCALE)) / 2);

        board = new Board('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', 0, true, true, true, true, true);

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


        whiteTime = new Timer(clientIsWhite, time, increment);
        blackTime = new Timer(clientIsWhite, time, increment);

        blackTime.showContainer(size);
        whiteTime.showContainer(size);
        updateCSSFromBoardSize();

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
            else if (!board.whiteToMove && (pieceAtMouse.colour === PieceType.black) && !clientIsWhite) {
                legalCircles = board.allPiecesLegalSquares(pieceAtMouse);
            }
            // var end = performance.now();
            // print('time taken ' + (end - start));
            MouseDown = true;

        } else legalCircles = [];

    }

    p5.mouseReleased = () => {
        MouseDown = false;
        board.shortCastles = false;
        board.longCastles = false;
        let legalSideAttemptedMove = false;
        let isLegal = false;

        console.log('client');
        console.log(clientIsWhite == true);

        if (clientIsWhite === (pieceAtMouse.colour === PieceType.white)) legalSideAttemptedMove = true;

        let destCoords = front.getMouseCoord(clientIsWhite, p5.mouseX, p5.mouseY); // returns coord for array         

        if (board.isOnBoard(destCoords.y, destCoords.x) && pieceAtMouse && legalSideAttemptedMove) {

            if (pieceAtMouse.type === PieceType.king) {
                //king moves need the bitmap before due to castling through a check
                if (board.checkNextMoveBitmap(pieceAtMouse, destCoords.y, destCoords.y) === true) {
                    if (board.isLegalKingMove(pieceAtMouse, destCoords.y, destCoords.x)) isLegal = true;

                }
            } else {
                if (board.isLegalMove(pieceAtMouse, destCoords.y, destCoords.x)) {
                    //doesn't need the bitmap first as it can find after a move has been made whether or not it is in check
                    if (board.checkNextMoveBitmap(pieceAtMouse, destCoords.y, destCoords.x) === true) isLegal = true;
                }
            }
        }

        if (isLegal) {
            let timeTaken;
            if (board.moveCounter > 0) {
                timeMoveEnd = Date.now();
                timeTaken = (timeMoveEnd - timeMoveStart) / 1000;
            } else timeTaken = 0;

            var data =
            {
                fCoordsX: destCoords.x, fCoordsY: destCoords.y, pieceMoved: pieceAtMouse, room: roomCode, "board": board, "FEN": board.boardToFEN(), "timeTaken": timeTaken, "whiteMoveMade": clientIsWhite
            };
            socket.emit('moveAttempted', data);
            console.log('legal');

            if (board.enPassentTaken) {
                board.updateEnPassentMove(pieceAtMouse, destCoords.y, destCoords.x);
            }
            else {
                //if they didn't castle -> call the function which makes a normal move
                board.updatePiecePos(pieceAtMouse, destCoords.y, destCoords.x); //castling changes position inside the castles function
            }
            //create a new bitmap for the current legal position for board.kingInCheck()
            let bmap = board.findMaskSquares(board.whiteToMove, board.occSquares);
            board.maskBitMap(bmap);

            if (board.kingInCheck()) {
                board.isInCheck = true;

            } else board.isInCheck = false;

        }


    }

    p5.windowResized = () => {
        WIDTH = canvasDiv.offsetWidth;
        HEIGHT = canvasDiv.offsetHeight;

        size = Math.min(WIDTH, HEIGHT);
        front.blockSize = (size) / 8; //can be width but it is a square
        front.spacing = Math.floor((front.blockSize * (1 - front.pieceScale)) / 2);
        p5.resizeCanvas(size, size);

        updateCSSFromBoardSize();
        blackTime.showContainer(size);
        whiteTime.showContainer(size);
    }

});