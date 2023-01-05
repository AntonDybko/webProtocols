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
const users = [];

server.on("connect", function(){
    server.subscribe("onConnected")
    server.subscribe("twits")
    server.subscribe("leaveChat")
    server.subscribe('checkedTwits')
    //server.subscribe('load')
    //server.publish("onConneted", "gogo")
})
server.on("message", (topic, string)=>{
    if(topic.toString()==='onConnected'){
        //console.log(`${string}|onConnected`)
        const mail_id_perm = string.toString().split('|')
        if(!users.includes(mail_id_perm[1])){
            users.push(mail_id_perm[1])
        }
        console.log(users)
        server.publish("checkedTwits", `${mail_id_perm[1]}|${mail_id_perm[0]}|${mail_id_perm[0]} has joined chat.|${mail_id_perm[2]}`)//joining chat
    }
    if(topic.toString()==="twits"){
        const id_mail_twit_role = string.toString().split('|')
        if(users.includes(id_mail_twit_role[0])){
            console.log('twit confirmed')
            if(id_mail_twit_role[3] != 'MUTED'){
                server.publish('checkedTwits', string)
            }
            //server.publish('checkedTwits', string)
        }
    }
    if(topic.toString()==="leaveChat"){
        const mail_id_perm = string.toString().split('|');
        console.log(`leaveChat: ${mail_id_perm[1]}`);
        for(let i =0; i<users.length; i++){
            if(users[i]===mail_id_perm[0]){
                users.splice(i, 1)
            }
        }
        server.publish("checkedTwits", `${mail_id_perm[0]}|${mail_id_perm[1]}| has left chat.|${mail_id_perm[2]}`)
    }
})

const port = 3002;
app.listen(port);
console.log(`Listening to port ${port}`);