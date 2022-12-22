import express from 'express'
var app = express();
app.use(bodyParser.json());
//socket = io.connect('http://' + location.host);
//var socket = io.connect()
window.addEventListener("load", function (event) {

});
io.connect(`http://localhost:3000/`)
const username = prompt("Please enter a username: ", "");

function createChat (name){
  console.log(`${username} joined ${name}`)
  /*app.post('/', function (req, res) {
    res.send(`${name},${username}`)
  })*/
  //socket.join("room-"+name)
  //socket.emit(`${username} created ${name}`, "room-"+name);
  //console.log(`${username} created ${name}`)
}



