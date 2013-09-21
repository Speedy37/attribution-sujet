var config = require('./config');
var User = require('./lib/user');

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

io.set('log level', 2);

server.on('listening', function () {
  console.log("Server is listening to : " + config.server.host + ":" + config.server.port + "\n Use http://webmail.c9.dev.speedy37.fr/static/index.html");
});

server.listen(config.server.port, config.server.host);

app.use(express.bodyParser());
app.use('/static', express.static(__dirname + '/static'));

io.sockets.on('connection', function (socket) {

  socket.on('login', function (data, callback) {
    if (typeof data.num !== "string" || data.num.length === 0 || data.num.length >= 255) {
      callback({
        'error': "bad-num-format"
      });
    }
    else if (typeof data.password !== "string" || data.password.length === 0 || data.password.length >= 255) {
      callback({
        'error': "bad-password-format"
      });
    }
    else {
      User.login(data.num, data.password, socket, callback);
    }
  });

  socket.on('session-login', function (session, callback) {
    if (typeof session !== "string" || session.length === 0) {
      callback({
        'error': "bad-session-format"
      });
    }
    else {
      User.sessionLogin(session, socket, callback);
    }
  });

});
