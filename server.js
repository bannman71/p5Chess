const express = require('express');
const app = express();
const router = express.Router();


var server = app.listen(3000);

router.get('/Home', (req,res) => {
  res.send('Hello World, This is home router');
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

app.use(express.static(`${__dirname}/public`));
app.use('/', router);


app.listen(4000);
console.log('listening on port 3000');