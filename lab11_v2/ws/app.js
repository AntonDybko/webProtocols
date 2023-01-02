'use strict';
const mqtt = require('mqtt')
const express = require('express')
const connect = require("connect");
const app = express()
const serveStatic = require('serve-static');
const httpServer = require("http").createServer(app);
app.use(serveStatic("public"));


app.get('/', function(req, res){
    res.send(
        `<form method="POST" action="">
        <h1 id="title">WebSocket API</h1>
        <h3>Chats:</h3>
        <ul id="chats"></ul>
        <h3>Create your char:</h3>
        <input type="text" id="roomName">
        <button id="btn" onclick="createChat(document.getElementById('roomName').value, document.getElementById('chats'))">Create your chat</button>
        <h3>Write twit</h3>
        <div>chat:</div>
        <input type="text" id="chatName">
        <div>text:</div>
        <input type="text" id="twit">
        <button id="twitbutton" onclick="sendTwit(document.getElementById('twit').value, document.getElementById('chatName').value)">Send ></button>
        <h3>Twits</h3>
        <div id="twits"></div>
        <script>
          //const mqtt = require('mqtt')
          //import * as mqtt from "mqtt";
          const mqtt = require('mqtt')
      
          const clientIndexId = 'mqttjs_' + Math.random().toString(16).substr(2, 8)
      
          const host = 'ws://broker.emqx.io:8083/mqtt'
      
          const options = {
            keepalive: 60,
            clientId: clientIndexId,
            protocolId: 'MQTT',
            protocolVersion: 4,
            clean: true,
            reconnectPeriod: 1000,
            connectTimeout: 30 * 1000,
            will: {
              topic: 'WillMsg',
              payload: 'Connection Closed abnormally..!',
              qos: 0,
              retain: false
            },
          }
          const client = mqtt.connect(host, options)
          
          client.on('loaded', chats => {
            const rooms = document.getElementById('chats')
            chats.forEach(chatname => {
              let li = document.createElement("li");
              li.innerText = chatname;
              li.id = chatname
              rooms.appendChild(li);
      
              let joinbutton = document.createElement("button");
              joinbutton.innerHTML = "Join";
              //joinbutton.onclick = function(){socket.emit("joinChat", chatname)}
              joinbutton.onclick = function(){
                li.removeChild(joinbutton)
                let leavebutton = document.createElement("button");
                leavebutton.innerHTML = "Leave";
                leavebutton.onclick = function(){
                  li.removeChild(leavebutton)
                  /*let joinbutton = document.createElement("button");
                  joinbutton.innerHTML = "Join";
                  joinbutton.onclick = function(){socket.emit("joinChat", chatname)}*/
                  li.appendChild(joinbutton);
                  client.publish("leaveChat", chatname)
                }
                li.appendChild(leavebutton);
                client.publish("joinChat", chatname)
              }
              li.appendChild(joinbutton);
            })
            
            let twits = document.getElementById("twits")
            client.on("twits", twit => {
              let div = document.createElement("div");
              div.innerText = twit;
              twits.appendChild(div)
              //console.log(twit)
            })
      
            client.on("deleteChat", chatname => {
              let child = document.getElementById(chatname)
              rooms.removeChild(child)
            })
          });
            </script>
        </form>`
    )
})
const serverId = 'mqttjs_' + Math.random().toString(16).substr(2, 8)

const host = 'ws://broker.emqx.io:8083/mqtt'

const options = {
  keepalive: 60,
  clientId: serverId,
  protocolId: 'MQTT',
  protocolVersion: 4,
  clean: true,
  reconnectPeriod: 1000,
  connectTimeout: 30 * 1000,
  will: {
    topic: 'WillMsg',
    payload: 'Connection Closed abnormally..!',
    qos: 0,
    retain: false
  },
}

console.log('Connecting mqtt client')
const server = mqtt.connect(host, options)

const users = [];
const chatRooms = []

server.on("connect", function(socket){
    //server.publish("loaded", chatRooms)
    server.subscribe('load', { qos: 0 })
    server.subscribe('roomManage', { qos: 0 })
    server.subscribe('joinChat', { qos: 0 })
    server.subscribe('leaveChat', { qos: 0 })
    server.subscribe('twit', { qos: 0 })
    
})

server.on("load", username => {
    users.push({
        socketId: socket.id,
        userName: username
    })
})
server.on("roomManage", arr => {
    socket.join(arr[1])
    chatRooms.push(arr[1])
    io.to(arr[1]).emit("create", arr)
})
server.on("joinChat", chatname => {
    socket.join(chatname)
    let name = users.filter(u => u.socketId == socket.id)[0].userName
    socket.to(chatname).emit("twits", [chatname, `(${name} joined room.)`])
})
server.on("leaveChat", async chatname => {
    let name = users.filter(u => u.socketId == socket.id)[0].userName
    socket.leave(chatname)
    socket.to(chatname).emit("twits", [chatname, `(${name} left room.)`])
    const sockets = await io.in(chatname).fetchSockets()
    if(sockets.length ==0){
        io.sockets.emit("deleteChat", chatname)
        chatRooms.pop(chatname)
    }
})
server.on("twit", twit_chat => {
    let name = users.filter(u => u.socketId == socket.id)[0].userName
    io.to(twit_chat[1]).emit("twits", [twit_chat[1], `(${name}: ${twit_chat[0]})`])
})

httpServer.listen(3000, function () {
 console.log('Serwer HTTP działa na pocie 3000');
});
