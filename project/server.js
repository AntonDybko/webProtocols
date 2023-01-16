var express  = require('express');
var app      = express();
var User = require('./app/models/user.js');
const mqtt = require('mqtt')//test mqtt
//const httpServer = require("http").createServer(app); //testing
//var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

//var configDB = require('./config/database.js');
mongoose.set("strictQuery", false); //test
mongoose.connect("mongodb://localhost:27017/gameStore", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
//test
const contactSchema = {
    email: String,
    query: String,
}; 
//const Contact = mongoose.model("Contact", contactSchema);

require('./config/passport')(passport); // pass passport for configuration

app.use(morgan('dev')); 
app.use(cookieParser()); 
app.use(bodyParser());
app.set('view engine', 'ejs');

app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); 
app.use(passport.initialize());
app.use(passport.session()); 
app.use(flash());
require('./app/routes.js')(app, passport);


//mqtt
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
//const users = [];
//const chatRooms = [{key:"chat1", users:[]}, {key:"newchat", users:[]}];
const chatRooms = [];
exports.server = server
exports.chatRooms = chatRooms

server.on("connect", function(){
    server.subscribe("leaveChat")
    server.subscribe("joinChat")
    server.subscribe('getChats')
    server.subscribe('roomManage')
    server.subscribe('am_i_in_chat')
    server.subscribe('checkMyChats')
    console.log('mqqt server is up')
})
server.on("message", (topic, string)=>{
    if(topic.toString()==='getChats'){
        const chats = chatRooms.map(room =>{
            return room.key
        })

        console.log(chats)//check?
        server.publish("sendChats", `${chats.join('|')}`)//joining chat
    }
    if(topic.toString()==='roomManage'){
        console.log(`roomManage: ${string.toString()}`)
        const chats = chatRooms.map(room =>{
            return room.key
        })
        if(!chats.includes(string.toString())){
            chatRooms.push({
                key:string.toString(),
                users:[]
            })
            server.publish("sendChats", chats.join('|'))
        }
    }
    if(topic.toString()==="checkMyChats"){
        const u_id = string.toString()
        const participation = []
        chatRooms.forEach(function(chat_users){
            if(chat_users.users.includes(u_id)){
                participation.push(1)
            }else{
                participation.push(0)
            }
        })
        server.publish(u_id, participation.join('|'))
    }
    if(topic.toString()==="am_i_in_chat"){
        const chat_id_mail_perm = string.toString().split('|');
        const in_chat = chatRooms.every(function(chat_users){
            if(chat_users.key==chat_id_mail_perm[0] && chat_users.users.includes(chat_id_mail_perm[1])){
                return false
            }else{
                return true
            }
        })
        if(in_chat===false) server.publish('you_are_in_chat', `true|${chat_id_mail_perm[1]}`)
        else server.publish('you_are_in_chat', `false|${chat_id_mail_perm[1]}`)
    }
    if(topic.toString()==="joinChat"){
        const chat_id_mail_perm = string.toString().split('|');
        chatRooms.forEach(function(chat_users){
            if(chat_users.key==chat_id_mail_perm[0] && !chat_users.users.includes(chat_id_mail_perm[1])){
                console.log(`${chat_users.users} before ${chat_id_mail_perm[2]} joined`)
                chat_users.users.push(chat_id_mail_perm[1])
                console.log(`${chat_users.users} after ${chat_id_mail_perm[2]} joined`)
            }
        })
        server.publish(chat_id_mail_perm[0], `${chat_id_mail_perm[1]}|${chat_id_mail_perm[2]}|has joined chat.|${chat_id_mail_perm[3]}`)
    }
    if(topic.toString()==="leaveChat"){
        console.log('try to leave')
        const chat_id_mail_perm = string.toString().split('|');
        chatRooms.forEach(function(chat_users){
            if(chat_users.key==chat_id_mail_perm[0] && chat_users.users.includes(chat_id_mail_perm[1])){
                console.log(`${chat_users.users} before ${chat_id_mail_perm[2]} leave`)
                let userIndex = chat_users.users.indexOf(chat_id_mail_perm[1])
                chat_users.users.splice(userIndex, 1)
                console.log(`${chat_users.users} after ${chat_id_mail_perm[2]} leave`)
                if(chat_users.users.length === 0){
                    let chatRoomIndex = chatRooms.indexOf(chat_users)
                    chatRooms.splice(chatRoomIndex, 1)
                    console.log(`${chat_id_mail_perm[0]} was deleted because of inactivity`)
                    console.log(chatRooms)
                }
            }
        })
        server.publish(chat_id_mail_perm[0], `${chat_id_mail_perm[1]}|${chat_id_mail_perm[2]}| has left chat.|${chat_id_mail_perm[3]}`)
    }
})
//exports.chatRooms = chatRooms

const port = 3000;
app.listen(port);
console.log(`Listening to port ${port}`);