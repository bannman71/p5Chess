var express = require('express');
var app = express();
var router = express.Router();

var server = app.listen(3000);

app.use(express.static('public'));


router.get('/Home', function(req, res, next) {
  res.render('users', { title: 'Users' });
});

console.log('listening on port 3000');