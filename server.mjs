import { Server } from 'socket.io';
import express from 'express';
import { createServer } from 'http';
const port = process.env.PORT || 3000;


const app = express(); 
const server = createServer(app).listen(port); 
const io = new Server(server);


import path from 'path';
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//IMPORTS FROM LOCAL MODULES
const dir = path.join(__dirname, '/public/views/');
import Board from './public/board.mjs';
import {ServerTimer} from "./public/timer.mjs";
import {PieceType} from './public/board.mjs';
import {Piece} from './public/board.mjs';
import { instantiateNewBoard } from './public/board.mjs';
import GameRoom from './public/gameRoom.mjs';
import PGN from './public/PGN.mjs';
//

var matchmaking = [];
var gameRooms = [];


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function coordFromRowCol(coords){
    let row = {0: 'a', 1: 'b', 2: 'c', 3: 'd', 4: 'e', 5: 'f', 6: 'g', 7: 'h'};

    return row[coords.row] + '' + coords.col;
}
function updateTableHTML(){
  //header
  let table = `
  <table class="table" styles="">
    <thead class="thead-dark">
      <tr>
          <th scope="col">Player</th>
          <th scope="col">Game Type</th>

        </tr>
    </thead>
    <tbody>
  `;

  //body of table -> contents and players queued
  for (let i = 0; i < matchmaking.length; i++){
    table = table + `
    <tr>
      <td>${matchmaking[i].id}</td>
      <td>${matchmaking[i].time}|${matchmaking[i].increment}</td>
    </tr>`;
  }

  //ending lines for table
  table = table + `
  </tbody>
  </table>
  `;
  io.sockets.emit("updateMatchmakingTable", table); //send all clients updated table

}

function generateRoomCode(){
  var roomCode = '';
  for (let i = 0; i < 6; i++){
    roomCode += String.fromCharCode(getRandomInt(48,122));
  }
  gameRooms.push({"roomCode": [gameRooms.length], "rC": roomCode});
  // make the roomcode return an index
  return roomCode;
}

io.on('connection', (socket) => {
  console.log('client connected');
  console.log(socket.id);

  socket.join('waitingRoom');
  updateTableHTML();

  //when 2 players have queued through matchmaking they are paired through this
  socket.on('matchConnect', (roomCode) => { 
    socket.leave('waitingroom');
    socket.join(roomCode);
  
    console.log('hello! on room ' + roomCode);
  });

  socket.on('timeControlChosen', (data) => {
    let alreadySearching = false;
    let gameFound = false;

    for(let m = 0; m < matchmaking.length; m++){
      if (matchmaking[m].id === data.id){ //checks if player has already picked something
        matchmaking[m] = data; //updates if the player changes what game type they want to find
        alreadySearching = true; //stops the same player from being duplicated in matchmaking
      }
    }
    if (!alreadySearching) matchmaking.push(data);

    //searches for a game and creates one if possible
    for (let i = 0; i < matchmaking.length; i++){
      for (let j = i + 1; j < matchmaking.length; j++){
        //if game found
        if ((matchmaking[i].time === matchmaking[j].time) && (matchmaking[i].increment === matchmaking[j].increment)){
          //moves matched players to game room
         
          let clients = io.sockets.adapter.rooms.get('waitingRoom');
          let roomCode = generateRoomCode();
          let colour1 = getRandomInt(0,1);
          let colour2 = Math.abs(colour1 - 1);

          for (let clientID of clients){
            const clientSocket = io.sockets.sockets.get(clientID);
            
            if (clientID === matchmaking[i].id){
              let data = {client: matchmaking[i], page: '/onlineGame', "roomCode": roomCode, 
              isWhite: colour1}; 
              clientSocket.emit('redirect', (data)); 
            }
            else if(clientID === matchmaking[j].id){
              let data = {client: matchmaking[j], page: '/onlineGame', "roomCode": roomCode, 
              isWhite: colour2};
              clientSocket.emit('redirect', (data));
            }
          }

          if (!gameRooms[roomCode]){
            let board = new Board('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', 0, true, true, true, true, true)
            let whiteTimer = new ServerTimer(matchmaking[i].time, matchmaking[j].increment);
            let blackTimer = new ServerTimer(matchmaking[i].time, matchmaking[j].increment);
            let pgn = new PGN([]);
            gameRooms[roomCode] = new GameRoom(
              roomCode, board, whiteTimer, blackTimer, pgn, []
            );
          }

          gameFound = true;

          console.log(gameRooms[roomCode].board.occSquares);


          //remove them from matchmaking list as they have found a game
          matchmaking.splice(j,1);
          matchmaking.splice(i,1);

          break;
        }
      if (gameFound) break;
      }
    }
    
    updateTableHTML();

  });
 
  socket.on('getClients', (data) => {
    console.log('getting them');
    console.log(gameRooms);
    let clients = io.sockets.adapter.rooms.get(gameRooms[0]);
    for (let client of clients){
      console.log(client);
    }
  });

  socket.on('disconnect', () => {
    for (let i = 0; i < matchmaking.length; i++){
      if (matchmaking[i].socket === socket) matchmaking.splice(i,1);
    }
    console.log('gone');
  });


  //GAME LOGIC

  socket.on('moveAttempted', function(data) { 
    //data = fCoordsX fCoordsY pieceMoved room board FEN timeTaken whiteMoveMade
    let isLegal = false;
    let tempEnPassentTaken = false;

    var piece = new Piece(data.pieceMoved.type, data.pieceMoved.row, data.pieceMoved.col, data.pieceMoved.colour);
    var board;

    board = instantiateNewBoard(data.board, data.FEN);

    let whiteTimer = gameRooms[data.room].whiteTimer;
    let blackTimer = gameRooms[data.room].blackTimer;

    whiteTimer = new ServerTimer(whiteTimer.time / 60, whiteTimer.increment);
    blackTimer = new ServerTimer(blackTimer.time / 60, whiteTimer.increment);

    if (piece.type === PieceType.king){
      if(board.checkNextMoveBitmap(piece, data.fCoordsY, data.fCoordsX) === true){ //king moves need the bitmap before due to castling through a check
        if (board.isLegalKingMove(piece, data.fCoordsY, data.fCoordsX)) isLegal = true;
      }
    } else {
      if (board.isLegalMove(piece, data.fCoordsY, data.fCoordsX)){ //doesn't need the bitmap first as it can find after a move has been made whether or not it is in check
        if (board.checkNextMoveBitmap(piece, data.fCoordsY, data.fCoordsX) === true) isLegal = true;
      }
    }

    if (isLegal){
      if (tempEnPassentTaken === true) {
        board.enPassentTaken = false;
      }

      // board.defendCheck();

      if (piece.type !== PieceType.pawn) board.pawnMovedTwoSquares = false;
      //is set to false here and in board.isLegalMove

      if (piece.colour === PieceType.black) {
        board.moveCounter++; //after blacks move -> the move counter always increases
      }
      console.log(board.moveCounter);
      if (board.enPassentTaken){
        board.updateEnPassentMove(piece, data.fCoordsY, data.fCoordsX);
      }
      else board.updatePiecePos(piece, data.fCoordsY, data.fCoordsX); 
      
      //create a new bitmap for the current legal position for board.kingInCheck()
      let bmap = board.findMaskSquares(board.whiteToMove, board.occSquares);
      board.maskBitMap(bmap); 

      board.isInCheck = board.kingInCheck();

      if (board.whiteToMove) {
        whiteTimer.update(data.timeTaken);
      } else blackTimer.update(data.timeTaken);

      board.changeTurn();
      let newFEN = board.boardToFEN();
      let pieceTypeMoved = PieceType.numToType[data.pieceMoved.type];
      let target = {"row": data.fCoordsY, "col": data.fCoordsX};
      let targetCrd = coordFromRowCol(target);
      // let newPGN = PGN.update(pieceTypeMoved, targetCrd);

      if (board.whiteToMove) { //slightly confusing as the turn state is changed a few lines above
        io.to(data.room).emit('legalMoveMade', ({"board": board, "FEN": newFEN, "newTimer": blackTimer}));
      } else io.to(data.room).emit('legalMoveMade', ({"board": board, "FEN": newFEN, "newTimer": whiteTimer}));
    }

  });

  //TODO
  socket.on('lostOnTime', (whiteToMove) => {
    if (whiteToMove){
      //end the game and display a game winning/losing card
    }
  });

});

// setInterval(function() {
//   console.log(matchmaking);
//   // do your stuff here.
// }, 2000);


app.get('/', (req,res) => {
  res.sendFile(path.join(dir, '/index.html'));
});

app.get('/onlineGame', (req, res) => {
  res.sendFile(path.join(dir, 'onlineGame.html'));
});


app.get('/Puzzles', (req,res) => {
  res.send('Hello World, This is puzzles router');
});


app.get('/BoardEditor', (req,res) => {
  res.sendFile(path.join(dir, '/BoardEditor.html'))
});


app.get('/PlayAi', (req,res) => {
  res.send('Hello World, This is AI router');
});

app.get('/PlayLocally', (req,res) => {
  res.sendFile(path.join(dir, 'playLocalGame.html'));
});

app.use(express.static(__dirname + '/public'));

console.log("listening on %s",port);
