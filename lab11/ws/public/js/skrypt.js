





const username = prompt("Please enter a username: ", "");
window.addEventListener("load", function (event) {
  client.on("connect", function(){
    console.log('connect')
    client.subscribe('checkedTwit')
    client.subscribe('loaded')
    client.subscribe('deleteChat')
    client.publish("onConnected", `${username},${clientId}`)

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









