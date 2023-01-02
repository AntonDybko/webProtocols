//const express = require('express');

//var app = express()
//app.use(bodyParser.json());

const socket = io.connect(`http://localhost:3001/`)
const username = prompt("Please enter a username: ", "");

window.addEventListener("load", function (event) {
  socket.emit("load", username)
});

function createChat (chatname, chats){
  if(chatname != ''){
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
        li.appendChild(leavebutton);
        socket.emit("joinChat", chatname)
      }
      li.appendChild(joinbutton);
      socket.emit("leaveChat", chatname)
    }
    li.appendChild(leavebutton);
  }
};

socket.on('loaded', chats => {
  const rooms = document.getElementById('chats')
  chats.forEach(chatname => {
    let li = document.createElement("li");
    li.innerText = chatname;
    li.id = chatname
    rooms.appendChild(li);

    let joinbutton = document.createElement("button");
    joinbutton.innerHTML = "Join";
    joinbutton.onclick = function(){
      li.removeChild(joinbutton)
      let leavebutton = document.createElement("button");
      leavebutton.innerHTML = "Leave";
      leavebutton.onclick = function(){
        li.removeChild(leavebutton)
        li.appendChild(joinbutton);
        socket.emit("leaveChat", chatname)
      }
      li.appendChild(leavebutton);
      socket.emit("joinChat", chatname)
    }
    li.appendChild(joinbutton);
  })
  
  let twits = document.getElementById("twits")
  socket.on("twits", twit => {
    let div = document.createElement("div");
    div.innerText = twit;
    twits.appendChild(div)
  })

  socket.on("deleteChat", chatname => {
    let child = document.getElementById(chatname)
    rooms.removeChild(child)
  })
});

function sendTwit (twit, chatname) {
  socket.emit("twit", [twit, chatname])
}







