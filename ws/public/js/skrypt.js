window.addEventListener("load", function (event) {
	
 socket = io.connect('http://' + location.host);

 socket.on('connect', function () {
   console.log('Nawiązano połączenie przez Socket.IO');
   socket.emit("test", "czesc");
  });
});
