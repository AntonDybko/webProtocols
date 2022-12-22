'use strict';
const connect = require("connect");
const app = connect();
const serveStatic = require('serve-static');

const httpServer = require("http").createServer(app);

const io = require("socket.io")(httpServer);

app.use(serveStatic("public"));

io.sockets.on("connection", function (socket) {
 socket.on("test", function (msg) {
  console.log(msg);
 });
});

httpServer.listen(3000, function () {
 console.log('Serwer HTTP działa na pocie 3000');
});
