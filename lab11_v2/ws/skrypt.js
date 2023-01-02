
/*const clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8)

const host = 'ws://broker.emqx.io:8083/mqtt'

const options = {
  keepalive: 60,
  clientId: clientId,
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
const client = mqtt.connect(host, options)*/
const username = prompt("Please enter a username: ", "");

function createChat (chatname, chats){
  client.publish("roomManage",[username, chatname])
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
    client.publish("leaveChat", chatname)
  }
  li.appendChild(leavebutton);
};

function sendTwit (twit, chatname) {
  client.publish("twit", [twit, chatname])
}







