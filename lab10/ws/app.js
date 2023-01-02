'use strict';
const connect = require("connect");
const app = connect();
const serveStatic = require('serve-static');

const httpServer = require("http").createServer(app);

const io = require("socket.io")(httpServer);

app.use(serveStatic("public"));

//const rooms = io.of("/").adapter.rooms;
//const sids = io.of("/").adapter.sids;

const users = [];
const chatRooms = []

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
    socket.emit("loaded", chatRooms)
    socket.on("load", username => {
        users.push({
            socketId: socket.id,
            userName: username
        })
    })
    socket.on("roomManage", arr => {
        socket.join(arr[1])
        chatRooms.push(arr[1])
        io.to(arr[1]).emit("create", arr)
    })
    socket.on("joinChat", chatname => {
        socket.join(chatname)
        let name = users.filter(u => u.socketId == socket.id)[0].userName
        socket.to(chatname).emit("twits", [chatname, `(${name} joined room.)`])
    })
    socket.on("leaveChat", async chatname => {
        let name = users.filter(u => u.socketId == socket.id)[0].userName
        socket.leave(chatname)
        socket.to(chatname).emit("twits", [chatname, `(${name} left room.)`])
        const sockets = await io.in(chatname).fetchSockets()
        if(sockets.length ==0){
            io.sockets.emit("deleteChat", chatname)
            chatRooms.pop(chatname)
        }
    })
    socket.on('disconnect', function(){
        let name = users.filter(u => u.socketId == socket.id)[0].userName
        socket.leave(chatname)
        socket.to(chatname).emit("twits", [chatname, `(${name} left room.)`])
        const sockets = await io.in(chatname).fetchSockets()
        if(sockets.length ==0){
            io.sockets.emit("deleteChat", chatname)
            chatRooms.pop(chatname)
        }
    });
    socket.on("twit", twit_chat => {
        let name = users.filter(u => u.socketId == socket.id)[0].userName
        io.to(twit_chat[1]).emit("twits", [twit_chat[1], `(${name}: ${twit_chat[0]})`])
    })
    
})

httpServer.listen(3001, function () {
 console.log('Serwer HTTP działa na pocie 3000');
});
