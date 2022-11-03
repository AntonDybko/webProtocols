import { v4 as uuidv4 } from 'uuid';
import express from "express"
import { Readline } from 'readline/promises';

//var express = require('express');
var app = express();

//const id = []
//const games = []
const games = {}
app.get('/', function (req, res) {
    let idOfGame = uuidv4()
    games[idOfGame] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
    //id.push(idOfGame)
    //games.push([[0, 0, 0], [0, 0, 0], [0, 0, 0]])
    res.send('Start game! idOfGame: ' + idOfGame + ". To enter your game, wright => localhost:3000/idOfGame");
    //test
    console.log(games[idOfGame])
});

app.get('/:gameId', function (req, res) {
    let gameId = req.params.gameId
    //testid
    console.log(gameId)
    console.log(games[gameId])
})

app.put('/:gameId', JsonParser, function (req, res) {
    //jsonparser??????????????????????????
})


app.listen(3000, function () {
    console.log('Example app listening on port 3000.');
});