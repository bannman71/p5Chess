import Board from './board.mjs';
import {PieceType} from './board.mjs'; 
import Front from './front.mjs';
import PGN from './PGN.mjs';
import { Grid } from './gridjs.mjs';
import { FENToBoard } from './board.mjs';

new p5(function(p5){
    var canv;
    var canvasDiv;
    
    var board;
    var front;
    
    var BLOCK_SIZE;
    var PIECE_SCALE;
    var WIDTH, HEIGHT, SPACING;
    var size;
    const BIN_PIECES = {20: 'b_bishop', 17: 'b_king', 19: 'b_knight', 18: 'b_pawn', 22: 'b_queen', 21: 'b_rook',
    12: 'w_bishop', 9: 'w_king', 11: 'w_knight', 10: 'w_pawn', 14: 'w_queen', 13: 'w_rook'}
    
    let IMAGES = {};
    
    
    // let board;
    let bitmap;
    
    let legalCircles = [];
    
    let MouseDown;
    let pieceAtMouse;
    let selectedCoords;
    
    let pgn;
    let moveCounterToFind;
    let PGNToFind;
    let displayOldPosition = false;
    let oldPosFEN;

    let grid;
    let gridData = [];



    p5.setup = () =>{
        canvasDiv = document.getElementById('board-container');
        WIDTH = canvasDiv.offsetWidth;
        HEIGHT = canvasDiv.offsetHeight;
        
        canv = p5.createCanvas(WIDTH, HEIGHT);
        canv.parent("board-container");

        PIECE_SCALE = 1;

        BLOCK_SIZE = WIDTH / 8;

        const queryString = window.location.search;
        const urlParameters = new URLSearchParams(queryString);
        var time = urlParameters.get('time');
        var increment = urlParameters.get('increment');

        SPACING = Math.floor((BLOCK_SIZE * (1 - PIECE_SCALE)) / 2);

        board = new Board('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', 1, true, true, true, true, true);

        board.maskBitMap(board.findMaskSquares(!board.whiteToMove, board.occSquares));

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

        pgn = new PGN([], [], []);

        for (let im in BIN_PIECES){
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
        front.drawCoordinates(board.whiteToMove);
        if (displayOldPosition && oldPosFEN !== '') {
            let pos = FENToBoard(oldPosFEN);
            front.drawAllPieces(board.whiteToMove, pos, pieceAtMouse)
        } else front.drawAllPieces(board.whiteToMove, board.occSquares, pieceAtMouse);
        if (MouseDown) {
            front.drawPieceAtMousepos(pieceAtMouse, p5.mouseX, p5.mouseY);
            front.drawLegalSquares(board.whiteToMove, legalCircles);
        } else pieceAtMouse = 0;
        if (MouseDown){
            front.drawPieceAtMousepos(pieceAtMouse, p5.mouseX, p5.mouseY);
            front.drawLegalSquares(board.whiteToMove, legalCircles);
        }
        else pieceAtMouse = 0;
    }

    p5.mousePressed = () => {
        let tempPieceAtMouse;
        pieceAtMouse = front.getPieceAtMousepos(board.whiteToMove, board.occSquares,p5.mouseX,p5.mouseY); //returns type Piece
        if (pieceAtMouse !== tempPieceAtMouse) legalCircles = []; //empties legalcircles so that it doesn't show the squares when you click on another piece
        tempPieceAtMouse = pieceAtMouse;
        
        if (pieceAtMouse){

            // var start = performance.now();
            if (board.whiteToMove === (pieceAtMouse.colour === PieceType.white)){
                legalCircles = board.allPiecesLegalSquares(pieceAtMouse);
            }
            // var end = performance.now();
            // print('time taken ' + (end - start));
            MouseDown = true;
            
        }else legalCircles = [];
        
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
                displayOldPosition = true;
                console.log('ododoodo');
            } else PGNToFind = '';

        })
    }

    p5.mouseReleased = () => {
        MouseDown = false;
        board.castled = false;
        let isLegal = false;
        let tempEnPassentTaken = false;
        let newFEN;
        let pieceMovedNtn;

        let numDefenses = 0;

        let destCoords = front.getMouseCoord(board.whiteToMove, p5.mouseX, p5.mouseY); // returns coord for array [0,0] [1,1] etc     

        if (board.isOnBoard(destCoords.y, destCoords.x) && pieceAtMouse){
            tempEnPassentTaken = board.enPassentTaken;

            if (pieceAtMouse.type === PieceType.king){
                if(board.checkNextMoveBitmap(pieceAtMouse,destCoords.y,destCoords.x) === true){ //king moves need the bitmap before due to castling through a check
                    if (board.isLegalKingMove(pieceAtMouse,destCoords.y,destCoords.x)) isLegal = true;
                }
            } else {
                if (board.isLegalMove(pieceAtMouse,destCoords.y,destCoords.x)){ //doesn't need the bitmap first as it can find after a move has been made whether or not it is in check
                    if (board.checkNextMoveBitmap(pieceAtMouse,destCoords.y,destCoords.x) === true) isLegal = true;
                }
            }


            if (isLegal){
                if (tempEnPassentTaken === true) {
                    board.enPassentTaken = false;
                }

                
                let target = {"col": destCoords.x, "row": destCoords.y};
                pieceMovedNtn = board.pieceMovedNotation(pieceAtMouse, target);

                if (pieceAtMouse.type !== PieceType.pawn) board.pawnMovedTwoSquares = false;
                //is set to false here and in board.isLegalMove


                if (pieceAtMouse.colour === PieceType.black) board.moveCounter++; //after blacks move -> the move counter always increases

                
                if (board.enPassentTaken){
                    board.updateEnPassentMove(pieceAtMouse,destCoords.y,destCoords.x);
                }
                else{
                    if (!board.castled) board.updatePiecePos(pieceAtMouse,destCoords.y,destCoords.x); //castling changes position inside the castles function
                }
            
                let bmap = board.findMaskSquares(board.whiteToMove, board.occSquares);
                board.maskBitMap(bmap); //create a new bitmap for the current legal position for board.kingInCheck()

                if (board.kingInCheck()){
                    board.isInCheck = true;
                    
                    numDefenses = board.defendCheck();

                } else board.isInCheck = false;

                newFEN = board.boardToFEN();

                board.changeTurn();


                if (board.whiteToMove) {
                    gridData[gridData.length - 1][2] = pieceMovedNtn;
                    pgn.update(pieceMovedNtn, newFEN, board.moveCounter - 1)
                  } else {
                    gridData.push([board.moveCounter, '', '']);
                    gridData[gridData.length - 1][1] = pieceMovedNtn;
                    pgn.update(pieceMovedNtn, newFEN, board.moveCounter)
                  }
                  grid.updateConfig({
                      data: gridData
                  }).forceRender();
                  if (board.kingInCheck()){
                      board.isInCheck = true;
                      numDefenses = board.defendCheck();
                  } else board.isInCheck = false;
      
                  if (board.isInCheck && numDefenses === 0){
                      if (board.whiteToMove){
                          print('black wins');
                      } else print('white wins');
                  }
                  else if (board.calculateNumLegalMoves() === 0) print('stalemate');

            }
            
            


         
            pieceAtMouse = 0;
        }   

        $(window).click(function () {
            // return board to original state
            displayOldPosition = false;
            console.log('reset');
        });

        $('#game-moves-container').click(function (event) {
            event.stopPropagation();
        });

        setTimeout(() => {
            console.log(PGNToFind); //don't remove this, it doesn't work without it
            if (PGNToFind !== '') {
                oldPosFEN = pgn.find(moveCounterToFind, PGNToFind);
                console.log(oldPosFEN);
            }
        }, 1);

    }

    p5.windowResized = () => {
        WIDTH = canvasDiv.offsetWidth;
        HEIGHT = canvasDiv.offsetHeight;

        size = Math.min(WIDTH, HEIGHT);
        front.blockSize = (size) / 8;
        front.spacing = Math.floor((front.blockSize * (1 - front.pieceScale)) / 2);
        p5.resizeCanvas(size, size);
    }
});