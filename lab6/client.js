//var tunnel = require('tunel-ssh');
import tunnel from "tunnel-ssh" 
import axios from "axios"

var config = {
    username:'adybko',
    password:'StdGdansk2021',
    host:"sigma.ug.edu.pl",
    port:22,
    dstHost:"sigma.ug.edu.pl",
    dstPort:8080,
    localHost:'127.0.0.1',
    localPort: 3000
};

const printGame = (game) =>{
    //let result = "-------------------"

    console.log("-------------------")
    Array.from(game).forEach(element => {
        console.log("| ",element[0]," | ", element[1]," | ", element[2]," | ")
        //result += ("| ",element[0]," | ", element[1]," | ", element[2]," | ")
    });
    console.log("-------------------")

    //result += "-------------------"
    //return result
}

var tnl = tunnel(config, function (error, server) {
    const gameId = axios.get("http://localhost:3000/").then(res => {
        const getine = res.data.split(" ")
        return getine[3]
    })
    gameId.then((id) => {
        console.log(id)
        axios.get(`http://localhost:3000/${id}`).then(res => {
            console.log(res.data)
            const game = res.data.split(":")
            console.log(id)
            //printGame(game[1])
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

