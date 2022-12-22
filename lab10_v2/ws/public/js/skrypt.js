
//socket = io.connect('http://' + location.host);
//var socket = io.connect()


//var socket = io.connect(`http://localhost:3000/`)
//const username = prompt("Please enter a username: ", "");

//const chats = []
let chats = document.getElementById("chats");

window.addEventListener("load", function (event) {
  /*const socket = io.connect(`http://localhost:3000/`)
  const username = prompt("Please enter a username: ", "");

  socket.on("Create", arr => {
    console.log(arr[1])
    console.log(arr[0])
  })*/
  socket.on("Create", arr => {
    console.log("Strona clienta")
    //chats.push(arr[1])
    let li = document.createElement("li");
    li.innerText = arr[1];
    chats.appendChild(li);
  
    console.log(`client chats: ${chats}`)
  })

});


const socket = io.connect(`http://localhost:3000/`)
const username = prompt("Please enter a username: ", "");

/*socket.on("Create", arr => {
  console.log(arr[0])
  //chats.push(arr[1])
  let li = document.createElement("li");
  li.innerText = arr[1];
  chats.appendChild(li);

  console.log(`client chats: ${chats}`)
})*/
function createChat (chatname){
  socket.emit("roomManage",[username, chatname])
}



