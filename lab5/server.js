import { v4 as uuidv4 } from 'uuid';
import express from "express"
//import { Readline } from 'readline/promises';
import bodyParser from 'body-parser';//???
//import Math from 'Math'

var app = express();
app.use(bodyParser.json());
/*app.use(bodyParser.urlencoded({     
    extended: false
})); */
app.use(express.urlencoded());


const printGame = (game) =>{
    console.log("-------------------")
    game.forEach(element => {
        console.log("| ",element[0]," | ", element[1]," | ", element[2]," | ")
    });
    console.log("-------------------")
}

const ai = (game) => {
    const empty = []
    game.forEach(row =>{
        if(row.includes(0)){
            row.forEach(num =>{
                if(num==0){
                    //console.log(row.indexOf(num))
                    empty.push({
                        vertical: game.indexOf(row),
                        diagonal: row.indexOf(num)
                    })
                }
            })
        }
    })
    //console.log(empty)
    let index = empty[Math.floor(Math.random()*empty.length)]
    //console.log(index)
    game[index.vertical][index.diagonal] = Math.floor(Math.random()*2+1)
}

let games = {}
app.get('/', function (req, res) {
    let idOfGame = uuidv4()
    games[idOfGame] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
    res.send('Start game! idOfGame: ' + idOfGame + ". To enter your game, wright => localhost:3000/idOfGame");
    //console.log(games[idOfGame])
    printGame(games[idOfGame])
});

app.get('/:gameId', function (req, res, next) {
    let gameId = req.params.gameId
    res.send(
        `<form method="POST" action="">
            <div>Diagonal:</div>
            <input type="text" name="diagonal">
            <div>Vertical:</div>
            <input type="text" name="vertical">
            <div>Value(1 or 2):</div>
            <input type="text" name="value">
            <div><input type="submit"></div>
        </form>`
    );
})

app.post('/:gameId', function (req, res) {
    let gameId = req.params.gameId
    games[gameId][req.body.vertical][req.body.diagonal] = req.body.value
    ai(games[gameId])
    printGame(games[gameId])
    //res.send(JSON.stringify(req.body));
    //jsonparser??????????????????????????
})


app.listen(3000, function () {
    console.log('Example app listening on port 3000.');
});