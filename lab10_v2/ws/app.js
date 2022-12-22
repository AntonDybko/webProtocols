'use strict';
const connect = require("connect");
//const app = connect();
var app = express();
app.use(bodyParser.json());

const serveStatic = require('serve-static');
const express = require('express')

const httpServer = require("http").createServer(app);

const io = require("socket.io")(httpServer);

app.use(serveStatic("public"));

const rooms = io.of("/").adapter.rooms;
const sids = io.of("/").adapter.sids;

const users = [];

io.of("/").adapter.on("create-room", (room) => {
    console.log(`room ${room} was created`);
});
io.of("/").adapter.on("join-room", (room, id) => {
    console.log(`${id} has joined room ${room}`);
});
io.of("/").adapter.on("leave-room", (room, id) => {
    console.log(`socket ${id} has left room ${room}`);
});

io.on("connection", function(socket){
    socket.on('user_join', (name) => {
        this.username = name
        users.push({
            socketId: socket.id,
            userName: name
        })
        socket.emit('user_join', name);
        console.log(users)
    })
})

/*app.get('/', function(req, res){
    let dane = req.body.split(',')
    io.on
})*/
httpServer.listen(3000, function () {
 console.log('Serwer HTTP działa na pocie 3000');
});
