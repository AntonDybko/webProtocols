const express = require("express");

var app = express();

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

app.listen(3000)