
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
}







