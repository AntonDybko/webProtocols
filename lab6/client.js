//var tunnel = require('tunel-ssh');
import tunnel from "tunnel-ssh" 
import axios from "axios"
import express from "express"
import * as readline from "readline"
import bodyParser from 'body-parser';

var rl = readline.createInterface(
    process.stdin, process.stdout);

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

var app = express();
app.use(bodyParser.json());


const tnl = tunnel(config, function (error, server) {
    const gameId = axios.get("http://localhost:3000/").then(res => {
        const getine = res.data.split(" ")
        console.log("Your game url is: " + `http://localhost:3000/${getine[3]}`)
        return getine[3]
    })
    .then((id) => {
        //console.log(id)
        axios.get(`http://localhost:3000/${id}`).then(res => {
            console.log(res.data)
        }).then(()=>{
            const turn = () => {
                rl.question("Your turn:\ndiagonal:", (diagonal)=>{
                    rl.question("vertical:", (vertical)=>{
                        rl.question("value:", (value)=>{
                            axios.post(`http://localhost:3000/${id}`,{
                                diagonal: diagonal,
                                vertical: vertical,
                                value: value
                            }).then((res) =>{
                                console.log(res.data)
                                if(res.data == "You won" || res.data == "You lost"){
                                    //console.log(res.data)
                                    tnl.close()
                                }else {
                                    turn()
                                }
                            })
                        })
                    })
                })
            }
            turn()
        })
        //why undefined
    })

    
    /*setTimeout(function(){
        tnl.close();
      },15000);*/


});

