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

const dir = path.join(__dirname, '/public/views/');
import Board from './public/board.mjs';
import Timer from './public/timer.mjs';
import {PieceType} from './public/board.mjs';
import {Piece} from './public/board.mjs';

var matchmaking = [];
var gameRooms = [];


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateTableHTML(){
  //header
  let table = `
  <table class="table table-dark">
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


  socket.on('matchConnect', (roomCode) => { //when 2 players have queued through matchmaking they are paired through this
    const colours = {1: true, 0: false};
    socket.leave('waitingroom');
    socket.join(roomCode);
    //assign random colours to players
    if (gameRooms[roomCode].client.length === 0) {
      let decideColour = getRandomInt(0,1);
      gameRooms[roomCode].client.push({"isWhite": colours[decideColour], id: socket.id});
    }
    else {
      gameRooms[roomCode].client.push({"isWhite": !gameRooms[roomCode].client[0].isWhite, id: socket.id});
    }
    
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
        if ((matchmaking[i].time === matchmaking[j].time) && (matchmaking[i].interval === matchmaking[j].interval)){
          //moves matched players to game room
         
          let clients = io.sockets.adapter.rooms.get('waitingRoom');
          let roomCode = generateRoomCode();
        
          for (let clientID of clients){
            const clientSocket = io.sockets.sockets.get(clientID);
            
            if (clientID === matchmaking[i].id){
              clientSocket.emit('redirect', ({client: matchmaking[i], page: '/onlineGame', "roomCode": roomCode})); //emits to index.html -> !!decideColour coerces 1/0 into true/false
            }
            else if(clientID === matchmaking[j].id){
              clientSocket.emit('redirect', ({client: matchmaking[j], page: '/onlineGame', "roomCode": roomCode}));
            }
          }

          if (!gameRooms[roomCode]) gameRooms[roomCode] = {};
          gameRooms[roomCode].roomCode = roomCode;
          gameRooms[roomCode].board = new Board('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', 0, true, true, true, true, true);
          gameRooms[roomCode].whiteTimer = new Timer(matchmaking[i].time, matchmaking[j].increment);
          gameRooms[roomCode].blackTimer = new Timer(matchmaking[i].time, matchmaking[j].increment);
          gameRooms[roomCode].PGN = '';
          gameRooms[roomCode].client = [];

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

  socket.on('moveAttempted', function(data) { //data = fCoords, gameRoom and pieceMoved
    let isLegal = false;
    let tempEnPassentTaken = false;
    let numDefenses = 0;

    var piece = new Piece(data.pieceMoved.type, data.pieceMoved.row, data.pieceMoved.col, data.pieceMoved.colour);
    var board = gameRooms[data.room].board;


    if (data.pieceMoved.type === PieceType.king){
      if(board.checkNextMoveBitmap(piece, data.fCoordsY, data.fCoordsX) === true){ //king moves need the bitmap before due to castling through a check
        if (board.isLegalKingMove(piece, data.fCoordsY, data.fCoordsX)) isLegal = true;
      }
    } else {
      if (board.isLegalMove(piece, data.fCoordsY, data.fCoordsX)){ //doesn't need the bitmap first as it can find after a move has been made whether or not it is in check
        if (board.checkNextMoveBitmap(piece, data.fCoordsY, data.fCoordsX) === true) isLegal = true;
      }
    }


    if (isLegal){
      console.log('legal');
      if (tempEnPassentTaken === true) {
        board.enPassentTaken = false;
      }

      board.defendCheck();

      if (piece.type !== PieceType.pawn) board.pawnMovedTwoSquares = false;
      //is set to false here and in board.isLegalMove

      if (piece.colour === PieceType.black) board.moveCounter++; //after blacks move -> the move counter always increases
      
      if (board.enPassentTaken){
          board.updateEnPassentMove(piece, destCoords.y, destCoords.x);
      }
      else{
        //if they didn't castle -> call the function which makes a normal move
        if (!board.castled) board.updatePiecePos(piece,data.fCoordsY,data.fCoordsX); //castling changes position inside the castles function
      }
      //create a new bitmap for the current legal position for board.kingInCheck()
      let bmap = board.findMaskSquares(board.whiteToMove, board.occSquares);
      board.maskBitMap(bmap); 

      if (board.kingInCheck()){
        board.isInCheck = true;
        numDefenses = board.defendCheck();
      } else board.isInCheck = false;

      board.changeTurn();
      var newFEN = board.boardToFEN();
      console.log(newFEN);

      socket.emit('legalMoveMade', ({"board": board, "FEN": newFEN}));
      
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
