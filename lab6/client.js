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

tunnel(config, function (error, server) {
    const gameId = axios.get("http://localhost:3000/").then(res => {
        const getine = res.data.split(" ")
        const id = getine[3]
        return id
    })
    .then((id) => {
        console.log(id)
        axios.get(`http://localhost:3000/${id}`).then(res => {
            console.log(res.data)
            //console.log(id)
        })
    })
    

    /*axios.get(`http://localhost:3000/${gameId}`).then(function(res){
        console.log(res.data)
    })*/
});