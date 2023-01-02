




//const username = prompt("Please enter a username: ", "");
const username = prompt("Please enter a username: ", "");
window.addEventListener("load", function (event) {
  //const username = prompt("Please enter a username: ", "");
  //client.publish("load", `${username},${clientId}`)
  client.on("connect", function(){
    console.log('connect')
    client.subscribe('checkedTwit')
    client.subscribe('loaded')
    client.subscribe('deleteChat')
    client.publish("onConnected", `${username},${clientId}`)
    //client.publish("load", `${username},${clientId}`)
    console.log(username)
    console.log(clientId)
  })

});


function createChat (chatname, chats){
  if(chatname != ''){
    client.subscribe(chatname)
    console.log("roomManage try to pub")
    client.publish("roomManage", chatname)
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
        client.subscribe(chatname)
        client.publish("joinChat", `${chatname}|${clientId}`)
        client.publish('twits', `${chatname}|${clientId}|${username} joined ${chatname}`)
      }
      li.appendChild(joinbutton);
      client.publish('twits', `${chatname}|${clientId}|${username} left ${chatname}`)
      client.publish("leaveChat", `${chatname}|${clientId}`)
      client.unsubscribe(chatname)
      //client.unsubscribe(chatname)
    }
    li.appendChild(leavebutton);
    client.publish("joinChat", `${chatname}|${clientId}`)
    client.publish('twits', `${chatname}|${clientId}|${username} joined ${chatname}`)
  }
};

function sendTwit (twit, chatname) {
  console.log(twit, chatname)
  client.publish('twits', `${chatname}|${clientId}|${twit}`)
}


/*function createChat (chatname, chats){
  //client.publish("roomManage",[username, chatname])
  let message = new Paho.MQTT.Message(`${username}||${chatname}`);
  message.destinationName = "roomManage";
  message.qos = 0;
  client.send(message);

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
      //client.publish("joinChat", chatname)
      let join = new Paho.MQTT.Message(chatname);
      join.destinationName = "joinChat";
      join.qos = 0;
      client.send(join);
    }
    li.appendChild(joinbutton);
    //client.publish("leaveChat", chatname)
    let leave = new Paho.MQTT.Message(chatname);
    leave.destinationName = "leaveChat";
    leave.qos = 0;
    client.send(leave);
  }
  li.appendChild(leavebutton);
};

function sendTwit (twit, chatname) {
  //client.publish("twit", [twit, chatname])
  let twitmsg = new Paho.MQTT.Message([twit, chatname]);
  twitmsg.destinationName = "twit";
  twitmsg.qos = 0;
  client.send(twitmsg);
}*/







