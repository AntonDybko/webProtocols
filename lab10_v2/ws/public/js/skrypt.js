//const express = require('express');

//var app = express()
//app.use(bodyParser.json());

const socket = io.connect(`http://localhost:3001/`)
const username = prompt("Please enter a username: ", "");

window.addEventListener("load", function (event) {
});

function createChat (chatname, chats){
  socket.emit("roomManage",[username, chatname])
  let li = document.createElement("li");
  li.id = chatname
  li.innerText = chatname;
  chats.appendChild(li);
  
  let leavebutton = document.createElement("button");
  leavebutton.innerHTML = "Leave";
  leavebutton.onclick = function(){
    li.removeChild(leavebutton)
    let joinbutton = document.createElement("button");
    joinbutton.innerHTML = "Join";
    joinbutton.onclick = function(){
      li.removeChild(joinbutton)
      /*leavebutton = document.createElement("button");
      leavebutton.innerHTML = "Join";
      leavebutton.onclick = function(){socket.emit("joinChat", chatname)}*/
      li.appendChild(leavebutton);
      socket.emit("joinChat", chatname)
    }
    li.appendChild(joinbutton);
    socket.emit("leaveChat", chatname)
  }
  li.appendChild(leavebutton);
};

function sendTwit (twit, chatname) {
  socket.emit("twit", [twit, chatname])
}







