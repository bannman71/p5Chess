const express = require('express');
const app = express();
const router = express.Router();
var socket = require('socket.io');

const port = process.env.PORT || 3000;

const path = require('path');
const dir = path.join(__dirname, '/public/views/');

var server = app.listen(port);
var io = socket(server);

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
  <table class="table">
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

  gameRooms.push(roomCode);

  return roomCode;
}


function moveClientsToGameRoom(p1ID, p2ID){
  let clients = io.sockets.adapter.rooms.get('waitingRoom');
  let roomCode = generateRoomCode();
  console.log(roomCode);

  for (let clientID of clients){
    const clientSocket = io.sockets.sockets.get(clientID);

    if (clientID === p1ID || clientID === p2ID){
      clientSocket.leave('waitingRoom');
    
      clientSocket.join(roomCode);
    }
  }
}

io.on('connection', (socket) => {
  console.log('client connected');
  console.log(socket.id);

  socket.join('waitingRoom');
  updateTableHTML();
  

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

    for (let i = 0; i < matchmaking.length; i++){
      for (let j = i + 1; j < matchmaking.length; j++){
        if ((matchmaking[i].time === matchmaking[j].time) && (matchmaking[i].interval === matchmaking[j].interval)){
          console.log('socket ' + '' + socket.id);

          moveClientsToGameRoom(matchmaking[i].id, matchmaking[j].id);
          matchmaking.splice(j,1);
          matchmaking.splice(i,1);

          io.to(gameRooms[0]).emit('Hello', 'whatsup');
          gameFound = true;
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
    for (i = 0; i < matchmaking.length; i++){
      if (matchmaking[i].socket === socket) matchmaking.splice(i,1);
    }
    console.log('gone');
  });

});




// setInterval(function() {
//   console.log(matchmaking);
//   // do your stuff here.
// }, 2000);


router.get('/', (req,res) => {
  res.sendFile(path.join(dir, 'index.html'));
});

router.get('/OnlineGame', (req, res) => {

});


router.get('/Puzzles', (req,res) => {
  res.send('Hello World, This is puzzles router');
});


router.get('/BoardEditor', (req,res) => {
  res.sendFile(path.join(dir, '/BoardEditor.html'))
});


router.get('/PlayAi', (req,res) => {
  res.send('Hello World, This is AI router');
});

router.get('/PlayLocally', (req,res) => {
  res.sendFile(path.join(dir, '/playLocalGame.html'));
});

app.use(express.static(`${__dirname}/public`));
app.use('/', router);

console.log("listening on %s",port);
