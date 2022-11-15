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
    localPort: 3000,
    keepAlive: true
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
        console.log("Your game url is: " + `http://localhost:3000/${getine[3]}`)
        return getine[3]
    })
    .then((id) => {
        //console.log(id)
        axios.get(`http://localhost:3000/${id}`).then(res => {
            console.log(res.data)
            //res.array.forEach(el => console.log(el))
        })
        //why undefined
    })
    
    /*setTimeout(function(){
        tnl.close();
      },15000);*/


});

