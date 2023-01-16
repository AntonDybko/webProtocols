'use strict';
const mqtt = require('mqtt')
const connect = require("connect");
const app = connect();
const serveStatic = require('serve-static');
const httpServer = require("http").createServer(app);
app.use(serveStatic("public"));


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
server.on("connect", function(){
    server.subscribe("onConnected")
    server.subscribe("roomManage")
    server.subscribe("twits")
    server.subscribe("joinChat")
    server.subscribe("leaveChat")
})

server.on("message", (topic, string)=>{
    if(topic.toString()==='onConnected'){
        console.log(`${string}|onConnected`)
        console.log(users)
        console.log(chatRooms)
        const userid = string.toString().split(',')
        users.push({
            socketId: userid[1],
            userName: userid[0]
        })
        const chats = chatRooms.map(room =>{
            return room.key
        })
        server.publish("loaded", chats.join('|'))
    }
    if(topic.toString()==="roomManage"){
        console.log(`roomManage: ${string.toString()}`)
        chatRooms.push({
            key:string.toString(),
            value:[]
        })
        const chats = chatRooms.map(room =>{
            return room.key
        })
        server.publish("loaded", chats.join('|'))
    }
    if(topic.toString()==="joinChat"){
        const chat_id = string.toString().split('|')
        console.log(`joinChat: ${chat_id[0]}`)
        chatRooms.map(function(key_value){
            console.log(`${key_value.key} => ${chat_id[0]}`)
            if(key_value.key==chat_id[0]){
                console.log(`${chat_id[1]}, => ${chat_id[0]}`)
                key_value.value.push(chat_id[1])
            }
        }
        )
    }
    if(topic.toString()==="leaveChat"){
        const chat_id = string.toString().split('|')
        console.log(`leaveChat: ${chat_id[0]}`)
        chatRooms.map(function(key_value){
            //console.log(`${key_value.key} => ${chat_id[0]}`)
            if(key_value.key==chat_id[0]){
                //console.log(`${chat_id[1]}, => ${chat_id[0]}`)
                console.log(`${key_value.value} before leave `)
                key_value.value = key_value.value.filter(x => x != chat_id[1])
                console.log(key_value.value )
            }
        }
        )
    }
    if(topic.toString()==="twits"){
        console.log('twits')
        const chat_id_twit = string.toString().split('|')
        //console.log(chat_id_twit[0])
        let chat = chatRooms.filter(key_value => key_value.key==chat_id_twit[0])[0]
        console.log(chat.value)
        if(chat.value.includes(chat_id_twit[1])){
            server.publish(chat_id_twit[0], string)
        }
    }

})

httpServer.listen(3001, function () {
 console.log('Serwer HTTP działa na pocie 3000');
});
