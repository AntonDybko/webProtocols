//var tunnel = require('tunel-ssh');
import tunnel from "tunnel-ssh" 
import axios from "axios"

var config = {
    username:'adybko',
    password:'StdGdansk2021',
    host:"sigma.ug.edu.pl",
    port:22,
    dstHost:"sigma.ug.edu.pl",
    dstPort:3000,
    localHost:'127.0.0.1',
    localPort: 3000
};

var tnl = tunnel(config, function (error, server) {
    const gameId = axios.get("http://localhost:3000/").then(res => {
        const getine = res.data.split(" ")
        return getine[3]
    })
    .then((id) => {
        console.log(id)
        axios.get(`http://localhost:3000/${gameId}`).then(res => {
            console.log(res.data)
            //console.log(id)
        })
    })
    

    setTimeout(function(){
        // you only need to close the tunnel by yourself if you set the
        // keepAlive:true option in the configuration !
        tnl.close();
      },15000);

    /*axios.get(`http://localhost:3000/${gameId}`).then(function(res){
        console.log(res.data)
    })*/
});

