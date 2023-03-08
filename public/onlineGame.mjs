import Board, {FENToBoard} from './board.mjs';
import PGN from "./PGN.mjs";
import {PieceType} from './board.mjs';
import {instantiateNewBoard} from './board.mjs';
import ClientTimer from './timer.mjs';
import Front from './front.mjs';
import {Grid} from './gridjs.mjs';

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

    //this is the variable that stores the PGN and
    //is used to display it in a grid.
    let grid;
    let gridData = [];

    //if the user tabs out, a few cases must be taken care of to do with the setTimout 'catch-up run'
    let timeInactiveStart;
    let timeInactiveEnd;
    let windowInactive = false;

    let pgn;
    let moveCounterToFind;
    let PGNToFind;
    let displayOldPosition = false;
    let oldPosFEN;

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

    let moveSound;
    let captureSound;

    let lostGame = false;

    let tempPawnMovedTwoSquares;

    //SERVER SIDE LOGIC

    socket.on('legalMoveMade', (data) => { // is called when the opponent makes a legal move

        // must instantiate new objects as it doesn't keep its
        // methods when being sent over a sockets
        board = instantiateNewBoard(data.board, data.FEN);
        if (board.whiteToMove) blackTimer = new ClientTimer(clientIsWhite, false, (data.newTimer.time / 60), data.newTimer.increment);
        else whiteTimer = new ClientTimer(clientIsWhite, true, (data.newTimer.time / 60), data.newTimer.increment);

        pgn = new PGN(data.PGNarr, data.FENarr, data.pgnData);
        console.log('hello ');
        console.log(pgn);

        timeMoveStart = Date.now();

        //if the tab is inactive and the other player makes a move, a new inactive time
        //must be declared, else it will subtract the time from when the client tabbed out
        //during the other player's move.
        if (windowInactive) {
            timeInactiveStart = Date.now();
            console.log(Date.now());
        }

        gridData = data.newGridData;
        //update the moves DOM with the current PGN

        grid.updateConfig({
            data: gridData
        }).forceRender();

        if (data.captures) { //if a piece was taken play the sound
            captureSound.play();
        } else moveSound.play(); //otherwise make the move sound

        //calculates if stalemate or checkmate has happened
        console.log(board.maskMap);
        let numLegalMoves = board.calculateNumLegalMoves();
        if (numLegalMoves == 0 && !board.isInCheck) socket.emit('stalemate', roomCode);
        let mateData = {
            "whiteToMove": board.whiteToMove,
            "room": roomCode
        };
        console.log('check');
        console.log(board.isInCheck);
        console.log(numLegalMoves);
        if (numLegalMoves == 0 && board.isInCheck) {
            console.log('heyyyyyyyy');
            socket.emit('checkmate', mateData);
        }

    });

    socket.on('gameOverScreen', (data) =>{
        let popupContent = document.getElementById("popup-content");

        if (clientIsWhite){ 
            if (data.whiteLoses){ //if white lost
                document.getElementById("popup").style.backgroundColor = "#a52a2a";
                popupContent.innerHTML = data.losingScreen;
                openPopup();
            }else {
                document.getElementById("popup").style.backgroundColor = "#85a94e";
                popupContent.innerHTML = data.winningScreen;
                openPopup();
            }
        }else {
            if (data.whiteLoses){ //if black and white loses
                document.getElementById("popup").style.backgroundColor = "#85a94e";
                popupContent.innerHTML = data.winningScreen;
                openPopup();
            }else {
                document.getElementById("popup").style.backgroundColor = "#a52a2a";
                popupContent.innerHTML = data.losingScreen;
                openPopup();
            }
        } 
    });

    socket.on('stalemateScreen', (drawScreen) => {
        let popupContent = document.getElementById("popup-content");

        document.getElementById("popup").style.backgroundColor = "#808080";
        popupContent.innerHTML = drawScreen;
        openPopup();
    });

    socket.on('checkmateScreen', (data) => {
        let popupContent = document.getElementById("popup-content");
        if (clientIsWhite){
            if (data.whiteLoses){ // if client is white and white loses
                document.getElementById("popup").style.backgroundColor = "#a52a2a";
                popupContent.innerHTML = data.losingScreen;
                openPopup();
            }else{
                document.getElementById("popup").style.backgroundColor = "#85a94e";
                popupContent.innerHTML = data.winningScreen;
                openPopup();
            } 
        }else {
            if (data.whiteLoses){ //if client is black and white loses
                document.getElementById("popup").style.backgroundColor = "#85a94e";
                popupContent.innerHTML = data.winningScreen;
                openPopup();
            }else {
                document.getElementById("popup").style.backgroundColor = "#a52a2a";
                popupContent.innerHTML = data.losingScreen;
                openPopup();
            } 
        }
        
    });

    socket.on('rematchFound', (data) => {
        console.log('rematch found');
        let colour = urlParameters.get('isWhite');
        if (colour == 1) colour = 0;
        else if (colour == 0) colour = 1;
        var url = '/onlineGame' + '?time=' + data.time + '&increment=' + data.increment + '&roomCode=' + data.roomCode + '&isWhite=' + colour;
        window.location.href = url; //sends them to the page created above
    });;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
    


    //

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
            if (board.moveCounter > 1) {
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
            // special handling to avoid futile "catch up" run
            expected += dt;
            ina = true; //ensure the timer doesn't count down while the catch-up is happening.
        }

        // do what is to be done

        if (!ina) {

            if (board && board.moveCounter > 1 && !lostGame) {
                if (board.whiteToMove && whiteTimer.timeToDisplay > 0) {
                    whiteTimer.clientSideTimerUpdate();
                } else if (!board.whiteToMove && blackTimer.timeToDisplay > 0) {
                    blackTimer.clientSideTimerUpdate();
                }
                if (whiteTimer.timeToDisplay <= 0){
                    lostGame = true;
                    let data = {
                        "whiteLoses": true,
                        "room": roomCode
                    };
                    socket.emit('lostOnTime', (data));
                    
                }
                else if (blackTimer.timeToDisplay <= 0) {
                    lostGame = true;
                    let data = {
                        "whiteLoses": false,
                        "room": roomCode
                    };
                    socket.emit('lostOnTime', (data)); 
                    
                }
            }
        }

        expected += interval;
        setTimeout(step, Math.max(0, interval - dt)); // take into account drift
    }

    //

    function updateCSSFromBoardSize() {
        //changes the size of the card
        //based on the width of the board
        let boardWidth = $('#online-board-container').width();
        let gameInfoCSS = {
            'position': 'absolute',
            'left': ('%dpx', boardWidth),
            'top': '40px'
        };


        $('#online-game-info').css(gameInfoCSS);
    }

    function closePopup() {
        var el = document.getElementById('popup');
        var BG = document.getElementById('bgcover');
        el.style.display = 'none';
        BG.style.display = 'none';
    }

    function yo(){
        alert('yo');
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
                width: 300px;
                height: 300px;
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
                
                <div class="popup-body" id="popup-content" style="height: 160px;">${texts}</div>
                <button style="position: absolute; width: 125px; height: 100px; bottom:10px; right: 10px; padding: 10px; z-index: 9999;" class="btn btn-dark" id="rematch-btn">Rematch</button>
                <button style="position: absolute; padding: 10px; z-index: 9999; width: 125px; height: 100px; bottom: 10px; left: 10px" class="btn btn-dark" id="home-screen-btn" onclick="location.href='/';">Home screen</button>
            </div>
        `;

        // Add The Background cover
        let BG = document.createElement("div");
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
    }

    function openPopup() {
        var el = document.getElementById('popup');
        var BG = document.getElementById('bgcover');
        el.style.display = 'block';
        BG.style.display = 'block';


    }

    p5.preload = () => {
        const soundPath = '../sound/'
        moveSound = new Audio('../sound/Move.mp3');
        captureSound = new Audio(soundPath + 'Capture.mp3');
    }

    p5.setup = () => {
        canvasDiv = document.getElementById('online-board-container');
        WIDTH = canvasDiv.offsetWidth;
        HEIGHT = canvasDiv.offsetHeight;
        size = Math.min(WIDTH, HEIGHT);

        canv = p5.createCanvas(size, size);
        canv.parent("online-board-container");

        grid = new Grid({
            data: [[]],
            style: {
                table: {
                    border: 'none'
                },
                th: {
                    color: '#000',
                    'border-bottom': 'none',
                    'text-align': 'center'
                },
                td: {
                    'text-align': 'center',
                    'border': 'none'
                }
            }
        }).render(document.getElementById("game-moves-container"));


        addElement();
        closePopup();


        PIECE_SCALE = 1;

        BLOCK_SIZE = size / 8;

        console.log('white or not');
        console.log(clientIsWhite);

        SPACING = Math.floor((BLOCK_SIZE * (1 - PIECE_SCALE)) / 2);

        board = new Board('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', 1, true, true, true, true, true);

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


        pgn = new PGN([], [], []);


    }

    p5.draw = () => { //is the main p5 loop executed each frame
        p5.clear();
        p5.background(front.white);
        front.drawGrid();
        front.drawCoordinates(clientIsWhite);    
        if (displayOldPosition && oldPosFEN !== '') {
            let pos = FENToBoard(oldPosFEN);
            front.drawAllPieces(clientIsWhite, pos, pieceAtMouse)
        } else front.drawAllPieces(clientIsWhite, board.occSquares, pieceAtMouse);
        if (MouseDown) {
            front.drawPieceAtMousepos(pieceAtMouse, p5.mouseX, p5.mouseY);
            front.drawLegalSquares(clientIsWhite, legalCircles);
        } else pieceAtMouse = 0;

        whiteTimer.displayTime();
        blackTimer.displayTime();

        if (whiteTimer.time < 0 || blackTimer.time < 0) {
            socket.emit('lostOnTime', board.whiteToMove);
        }

    }

    p5.mousePressed = () => {
        pieceAtMouse = front.getPieceAtMousepos(clientIsWhite, board.occSquares, p5.mouseX, p5.mouseY); //returns type Piece
        legalCircles = [];

        if (!displayOldPosition && pieceAtMouse) {

            // var start = performance.now();
            if (board.whiteToMove && (pieceAtMouse.colour === PieceType.white) && clientIsWhite) {
                legalCircles = board.allPiecesLegalSquares(pieceAtMouse);
            } else if (!board.whiteToMove && (pieceAtMouse.colour === PieceType.black) && !clientIsWhite) {
                legalCircles = board.allPiecesLegalSquares(pieceAtMouse);
            }
            // var end = performance.now();
            // print('time taken ' + (end - start));
            MouseDown = true;

        } else legalCircles = [];

        grid.on('rowClick', (...args) => {
            //get the move counter of the row clicked
            JSON.stringify(args);
            moveCounterToFind = $.extend({}, args[1]._cells[0].data);

            moveCounterToFind = args[1]._cells[0].data;
            console.log(moveCounterToFind);
        });
        grid.off('cellClick').on('cellClick', (...args) => {
            //get the PGN of the clicked cell
            if (!Number.isInteger(args[1].data)) {
                console.log(args[1].data);
                PGNToFind = args[1].data;
                oldPosFEN =
                displayOldPosition = true;
            } else PGNToFind = '';

        })


    }

    p5.mouseReleased = () => {
        MouseDown = false;
        board.shortCastles = false;
        board.longCastles = false;
        let legalSideAttemptedMove = false;
        let isLegal = false;
        let captures = false;

        tempPawnMovedTwoSquares = board.tempPawnMovedTwoSquares;

        if (clientIsWhite === (pieceAtMouse.colour === PieceType.white)) legalSideAttemptedMove = true;

        let destCoords = front.getMouseCoord(clientIsWhite, p5.mouseX, p5.mouseY); // returns coord for array

        if (board.isOnBoard(destCoords.y, destCoords.x) && pieceAtMouse && legalSideAttemptedMove) {

            if (pieceAtMouse.type === PieceType.king) {
                //king moves need the bitmap before due to castling through a check
                if (board.checkNextMoveBitmap(pieceAtMouse, destCoords.y, destCoords.x) === true) {
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
            if (board.moveCounter > 1) {
                timeMoveEnd = Date.now();
                timeTaken = (timeMoveEnd - timeMoveStart) / 1000;
            }

            if (tempPawnMovedTwoSquares === true) board.pawnMovedTwoSquares = false;

            let data =
                {
                    fCoordsX: destCoords.x,
                    fCoordsY: destCoords.y,
                    pieceMoved: pieceAtMouse,
                    room: roomCode,
                    "board": board,
                    "FEN": board.boardToFEN(),
                    "timeTaken": timeTaken,
                    "wTime": whiteTimer,
                    "bTime": blackTimer,
                    "gridData": gridData,
                    "moveCounter": board.moveCounter,
                    "PGNarr": pgn.PGNarr,
                    "FENarr": pgn.FENarr,
                    "pgnData": pgn.Data
                };

            socket.emit('moveAttempted', data);
            console.log('legal');
            if (board.enPassentTaken) {
                board.updateEnPassentMove(pieceAtMouse, destCoords.y, destCoords.x);
                board.enPassentTaken = false;
            }
            else {
                //if they didn't castle -> call the function which makes a normal move
                board.updatePiecePos(pieceAtMouse, destCoords.y, destCoords.x);
            }
            //create a new bitmap for the current legal position for board.kingInCheck()
            let bmap = board.findMaskSquares(board.whiteToMove, board.occSquares);
            board.maskBitMap(bmap);

            board.isInCheck = board.kingInCheck();
               
            if (board.enPassentTaken) board.enPassentTaken = false;
        }

        //not part of the game logic

        

        $(window).click(function () {
            // return board to original state
            displayOldPosition = false;
        });

        $('#game-moves-container').click(function (event) {
            event.stopPropagation();
        });

        setTimeout(() => {
            console.log(PGNToFind); //don't remove this, it doesn't work without it
            if (PGNToFind !== '') oldPosFEN = pgn.find(moveCounterToFind, PGNToFind);
        }, 1);

        document.getElementById('rematch-btn').onclick = () => {
            let data = {
                "roomCode": roomCode,
                "time": time,
                "increment": increment,
                "clientIsWhite": clientIsWhite,
                "socketID": socket.id
            };
            socket.emit('attemptedRematch', data);
        };

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