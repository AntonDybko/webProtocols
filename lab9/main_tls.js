const https = require('node:https');
const fs = require('node:fs');
const express = require("express");


const options = {
  key: fs.readFileSync('./new_key.key'),
  cert: fs.readFileSync('./certyfikat.crt'),
};

var app = express();

https.createServer(options, app).listen(3000);

app.get('/', function (req, res) {
    res.send(
        `<form method="POST" action="">
            <div>Login</div>
            <input type="text" name="login">
            <div>Pass</div>
            <input type="text" name="pass">
            <div><button type="submit">Submit</button></div>
        </form>`
    )
});

app.post('/', function(req, res){
    res.send(
        `<div>Logowanie udało się</div>`
    )
})
//https://localhost:3000/