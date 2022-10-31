const express = require('express');
const app = express();
const router = express.Router();
const path = require('path');
const io = require('sockets.io');

const port = process.env.PORT || 3000;

const dir = path.join(__dirname, '/public/views/');


io.on('connection', function(socket){
  console.log('client connected');
  socket.on('clicked', function(){
    io.emit('clicked');
  });
});


router.get('/', (req,res) => {
  res.sendFile(path.join(dir, 'index.html'));
});


router.get('/Puzzles', (req,res) => {
  res.send('Hello World, This is puzzles router');
});


router.get('/BoardEditor', (req,res) => {
  res.send('Hello World, This is board editor router');
});


router.get('/PlayAi', (req,res) => {
  res.send('Hello World, This is AI router');
});

router.get('/PlayLocally', (req,res) => {
  res.sendFile(path.join(dir, '/playLocalGame.html'));
});

app.use(express.static(`${__dirname}/public`));
app.use('/', router);

app.listen(port);
console.log('listening on port 8080');