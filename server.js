const express = require('express');
const app = express();
const router = express.Router();
var socket = require('socket.io');

const port = process.env.PORT || 3000;

const path = require('path');
const { match } = require('assert');
const dir = path.join(__dirname, '/public/views/');

var server = app.listen(port);
var io = socket(server);

var matchmaking = [];


function updateTableHTML(socket){
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

  //body of table - contents and players queued

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
  socket.emit("updateMatchmakingTable", table);

}

io.on('connection', (socket) => {
  console.log('client connected');
  console.log(socket.id);

  updateTableHTML(socket);
  
  socket.on('timeControlChosen', (data) => {
    let alreadySearching = false;
    for(let m = 0; m < matchmaking.length; m++){
      if (matchmaking[m].id === data.id) alreadySearching = true;
    }
    if (!alreadySearching) matchmaking.push(data);

    //every time a new client searches for a game
    //search current players
    //if another player has same time and increment
    //pair them

    for (let i = 0; i < matchmaking.length; i++){
      for (let j = i + 1; j < matchmaking.length; j++){
        if ((matchmaking[i].time === matchmaking[j].time) && (matchmaking[i].interval === matchmaking[j].interval)){
          

          console.log('match made');
          socket.join(() => { //generate random room code
            var roomCode = '';
            for (let i = 0; i < 6; i++){
              roomCode += Math.floor((Math.random() * 122) + 48);
            }
            console.log('room ' + roomCode);

            matchmaking.splice(i, 1);
            matchmaking.splice(j, 1);

            return roomCode;
          });
        }
      }
    } 
    
    updateTableHTML(socket);

  });

  socket.on('disconnect', () => {
    console.log('gone');
  });

});


setInterval(function() {
  console.log(matchmaking);
  // do your stuff here.
}, 2000);


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
