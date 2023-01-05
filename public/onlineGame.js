import Board from './board.mjs';
import PGN from "./PGN.mjs";
import { PieceType } from './board.mjs';
import { instantiateNewBoard } from './board.mjs';
import ClientTimer from './timer.mjs';
import Front from './front.mjs';

new p5(function (p5) {
    // const socket = io('https://bannman71-p5chess-674rjrqr9vxh4grq-3000.preview.app.github.dev');
    const socket = io('http://localhost:3000');

    const queryString = window.location.search;
    const urlParameters = new URLSearchParams(queryString);
    var time = urlParameters.get('time');
    var increment = urlParameters.get('increment');
    var clientIsWhite = urlParameters.get('isWhite');

    clientIsWhite = clientIsWhite !== '0'; //if client is white set it to true else false

    var roomCode = urlParameters.get('roomCode');


    socket.emit('matchConnect', roomCode);

    var blackTimer, whiteTimer;
    var timeMoveStart = 0;
    var timeMoveEnd = 0;

    var canv;
    var canvasDiv;

    var board;
    var front;
    var size;

    //if the user tabs out, a few cases must be taken care of to do with the setTimout 'catch-up run'
    let timeInactiveStart;
    let timeInactiveEnd;
    let windowInactive = false;

    let pgn;

    var BLOCK_SIZE;
    var PIECE_SCALE;
    var WIDTH, HEIGHT, SPACING;
    const BIN_PIECES = {
        20: 'b_bishop', 17: 'b_king', 19: 'b_knight', 18: 'b_pawn', 22: 'b_queen', 21: 'b_rook',
        12: 'w_bishop', 9: 'w_king', 11: 'w_knight', 10: 'w_pawn', 14: 'w_queen', 13: 'w_rook'
    }

    let IMAGES = {};

    let legalCircles = [];

    let MouseDown;
    let pieceAtMouse;

    //SERVER SIDE LOGIC

    socket.on('legalMoveMade', (data) => { // is called when the opponent makes a legal move

        // must instantiate new objects as it doesn't keep its
        // methods when being sent over a sockets
        board = instantiateNewBoard(data.board, data.FEN);
        if (board.whiteToMove) blackTimer = new ClientTimer(clientIsWhite, false, (data.newTimer.time / 60), data.newTimer.increment);
        else whiteTimer = new ClientTimer(clientIsWhite, true, (data.newTimer.time / 60), data.newTimer.increment);

        pgn = new PGN();
        pgn.PGNarr = data.cPGN.PGNarr;
        pgn.FENarr = data.cPGN.FENarr;

        console.log('hello ');
        console.log(pgn);


        timeMoveStart = Date.now();

        //if the tab is inactive and the other player makes a move, a new inactive time
        //must be declared, else it will subtract the time from when the client tabbed out
        //during the other player's move.
        if (windowInactive){
            timeInactiveStart = Date.now();
            console.log(Date.now());
        }

        //TODO
        //update the moves DOM with the current PGN
        let table = `
           
        `;



    });

    function updateCSSFromBoardSize() {
        //changes the size of the card
        //based on the width of the board
        let boardWidth = $('#online-board-container').width();
        let gameInfoCSS = {
            'position': 'absolute',
            'left': ('%dpx', boardWidth),
            'top': '6%'
        };

        $('#online-game-info').css(gameInfoCSS);
    }

    function closePopup() {
        var el = document.getElementById('popup');
        var BG = document.getElementById('bgcover');
        el.style.display = 'none';
        BG.style.display = 'none';
    }

    function addElement() {
        // create a new div element
        // and give it popup content
        var newDiv = document.createElement("div");
        var texts = 'erd';
        newDiv.innerHTML += `
            <div id="popup" style=" 
                position: absolute;
                top: 25%;
                width: 500px;
                height: 500px;
                margin: auto;
                z-index: 99999;
                display: block;
                left:35%;
                background-color: #fff;
                border: 1px solid #ddd;
                border-radius: 5px;  
                box-shadow: 0 1px 6px 4px #000;  
                overflow: hidden;   
                padding: 10px;">
                
                <div class="popup_body" style="height: 160px;">${texts}</div>
                <button style="padding: 10px;" class="close_button" id="close-btn">This is bullshit</button>
                <button style="padding: 10px;" class="close_button">Something else</button>
            </div>
        `;

        // Add The Background cover
        let BG = document.createElement("div");
        //BG.style.background-color = 'black';
        BG.style.width = '100%';
        BG.style.height = '100%';
        BG.style.background = 'black';
        BG.style.position = 'fixed';
        BG.style.top = '0';
        BG.style.left = '0';
        BG.style.opacity = '0.9';
        BG.style.display = 'none';
        BG.setAttribute("id", "bgcover");

        // add the newly created elements and its content into the DOM
        document.body.appendChild(BG);
        document.body.insertBefore(newDiv, BG);
        // open popup onload
        openPopup();
    }

    function openPopup() {
        var el = document.getElementById('popup');
        var BG = document.getElementById('bgcover');
        el.style.display = 'block';
        BG.style.display = 'block';



    }

    p5.setup = () => {
        canvasDiv = document.getElementById('online-board-container');
        WIDTH = canvasDiv.offsetWidth;
        HEIGHT = canvasDiv.offsetHeight;
        size = Math.min(WIDTH, HEIGHT);

        canv = p5.createCanvas(size, size);
        canv.parent("online-board-container");


        addElement();

        pgn = new PGN();

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

        whiteTimer = new ClientTimer(clientIsWhite, true, time, increment);
        blackTimer = new ClientTimer(clientIsWhite, false, time, increment);
        
        blackTimer.showContainer(size);
        whiteTimer.showContainer(size);
        updateCSSFromBoardSize();
        whiteTimer.displayTime();
        blackTimer.displayTime();

    }

    p5.draw = () => { //is the main p5 loop executed each frame
        p5.clear();
        p5.background(front.white);
        front.drawGrid();
        front.drawAllPieces(clientIsWhite, board.occSquares, pieceAtMouse);
        if (MouseDown) {
            front.drawPieceAtMousepos(pieceAtMouse, p5.mouseX, p5.mouseY);
            front.drawLegalSquares(clientIsWhite, legalCircles);
        }
        else pieceAtMouse = 0;

        whiteTimer.displayTime();
        blackTimer.displayTime();

        if (whiteTimer.time < 0 || blackTimer.time < 0){
            socket.emit('lostOnTime', board.whiteToMove);

        }

    }

    //when the tab is inactive, this event happens.
    //setTimeout isn't called when tab is inactive so this counts how long the user was inactive for
    //in order to update the timer appropriately.
    document.addEventListener('visibilitychange', function (event) {
        if (document.hidden) {
            timeInactiveStart = Date.now();
            windowInactive = true;
        } else {
            windowInactive = false;
            timeInactiveEnd = Date.now();
            if (board.moveCounter > 0) {
                let timeTaken = timeInactiveEnd - timeInactiveStart;
                if (board.whiteToMove) {
                    whiteTimer.timeToDisplay -= timeTaken / 1000;
                } else {
                    blackTimer.timeToDisplay -= timeTaken / 1000;
                }
            }
        }
    });

    //

    //ticks the client-side timer down,
    //the actual time is stored server-side
    var interval = 100; // ms
    var expected = Date.now() + interval;
    let ina = false;
    setTimeout(step, interval);
    function step() {
        let dt = Date.now() - expected; // the drift (positive for overshooting)
        ina = false;
        if (dt > interval) {
            // something awful happened. Maybe the browser (tab) was inactive?
            // possibly special handling to avoid futile "catch up" run
            expected += dt;
            ina = true; //ensure the timer doesn't count down while the catch-up is happening.
        }
        // do what is to be done

        if (!ina) {
            if (board.moveCounter > 0) {
                if (board.whiteToMove) {
                    whiteTimer.clientSideTimerUpdate();
                } else {
                    blackTimer.clientSideTimerUpdate();
                }
            }
        }

        expected += interval;
        setTimeout(step, Math.max(0, interval - dt)); // take into account drift
    }

    //

    p5.mousePressed = () => {
        pieceAtMouse = front.getPieceAtMousepos(clientIsWhite, board.occSquares, p5.mouseX, p5.mouseY); //returns type Piece
        legalCircles = [];

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
            let timeTaken = 0;
            if (board.moveCounter > 0){
                timeMoveEnd = Date.now();
                timeTaken = (timeMoveEnd - timeMoveStart) / 1000;
                console.log('time');
                console.log(timeTaken);
            }
            let data =
            {
                fCoordsX: destCoords.x, fCoordsY: destCoords.y, pieceMoved: pieceAtMouse, room: roomCode, "board": board, "FEN": board.boardToFEN(), "timeTaken": timeTaken, "cPGN": pgn
            };
            socket.emit('moveAttempted', data);
            console.log('legal');

            if (board.enPassentTaken) {
                board.updateEnPassentMove(pieceAtMouse, destCoords.y, destCoords.x);
            }
            else {
                //if they didn't castle -> call the function which makes a normal move
                board.updatePiecePos(pieceAtMouse, destCoords.y, destCoords.x);
            }
            //create a new bitmap for the current legal position for board.kingInCheck()
            let bmap = board.findMaskSquares(board.whiteToMove, board.occSquares);
            board.maskBitMap(bmap);

            board.isInCheck = board.kingInCheck();

        }

        //not part of the game logic

        $("#close-btn").off('click').on("click", function() {
            closePopup();
        });

    }

    p5.windowResized = () => {
        WIDTH = canvasDiv.offsetWidth;
        HEIGHT = canvasDiv.offsetHeight;

        size = Math.min(WIDTH, HEIGHT);
        front.blockSize = (size) / 8;
        front.spacing = Math.floor((front.blockSize * (1 - front.pieceScale)) / 2);
        p5.resizeCanvas(size, size);

        updateCSSFromBoardSize();
        blackTimer.showContainer(size);
        whiteTimer.showContainer(size);
    }

});