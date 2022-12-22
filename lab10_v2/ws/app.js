'use strict';
const connect = require("connect");
const app = connect();
const serveStatic = require('serve-static');

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

io.sockets.on("connection", function(socket){
    //socket.on("roomManage", )
    //socket.to(array).emit("Creat or join room.")
    socket.on("roomManage", arr => {
        //console.log(arr)// test1
        socket.join(arr[1])
        socket.to(arr[1]).emit("Create", arr)
        this.username = arr[0]
        users.push({
            socketId: socket.id,
            userName: arr[0]
        })
        //console.log(users) //test2
        users.push({
            author:{
                socketId: socket.id,
                userName: arr[0]
            },
            roomName: arr[1]
        })
        //console.log(rooms) //test3
    })
})
/*io.on("connection", function(socket){
    socket.on('user_join', (name) => {
        this.username = name
        users.push({
            socketId: socket.id,
            userName: name
        })
        socket.emit('user_join', name);
        console.log(users)
    })
})*/

/*app.get('/', function(req, res){
    let dane = req.body.split(',')
    io.on
})*/
httpServer.listen(3000, function () {
 console.log('Serwer HTTP działa na pocie 3000');
});
