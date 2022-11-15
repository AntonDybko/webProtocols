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
    //let result = "-------------------"

    console.log("-------------------")
    game.forEach(element => {
        console.log("| ",element[0]," | ", element[1]," | ", element[2]," | ")
        //result += ("| ",element[0]," | ", element[1]," | ", element[2]," | ")
    });
    console.log("-------------------")

    //result += "-------------------"
    //return result
}

const ai = (game, res) => {
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
    if(checkWinner(game)==true){
        return true
    }else{
        return false
    }
}

const checkWinner = (game) => {
    let checker = false
    for(let i =0; i<3; i++){
        if((game[i][0] == 1 && game[i][1] == 1 && game[i][2] == 1) || (game[i][0] == 2 && game[i][1] == 2 && game[i][2] == 2)){checker = true}
        if((game[0][i] == 1 && game[1][i] == 1 && game[2][i] == 1) || (game[0][i] == 2 && game[1][i] == 2 && game[2][i] == 2)){checker = true}
    }
    if((game[0][0] == 1 && game[1][1] == 1 && game[2][2] == 1) || (game[0][0] == 2 && game[1][1] == 2 && game[2][2] == 2)){checker = true}
    if((game[0][2] == 1 && game[1][1] == 1 && game[0][2] == 1) || (game[0][2] == 2 && game[1][1] == 2 && game[2][0] == 2)){checker = true}
    return checker
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
    //res.send("")
    //let g = printGame(gameId)
    res.send("Your game:" + gameId)
    /*res.send(
        `<form method="POST" action="">
            <div>Diagonal:</div>
            <input type="text" name="diagonal">
            <div>Vertical:</div>
            <input type="text" name="vertical">
            <div>Value(1 or 2):</div>
            <input type="text" name="value">
            <div><input type="submit"></div>
        </form>`
    );*/
})

app.get('/lose', function (req, res){
    res.send('You Lost!');
})
app.get('/won', function (req, res){
    res.send('You won!');
})

app.post('/:gameId', function (req, res) {
    //example posta => 
    //curl -d "diagonal=0&vertical=0&value=2" -H "Content-Type: application/x-www-form-urlencoded" -X POST http://localhost:3000/0055f2b1-a136-4c8f-bb72-db498423416c
    let gameId = req.params.gameId
    if(games[gameId][req.body.vertical][req.body.diagonal]==0){
        games[gameId][req.body.vertical][req.body.diagonal] = req.body.value
        let checkai = ai(games[gameId], res)
        printGame(games[gameId])
        if(checkai==true){
            res.redirect("/lose")
            console.log("You won")
        }else{
            if(checkWinner(games[gameId])==true){
                res.redirect("/won")
                console.log("You won")
            }else{
                res.send("")
            }
        }
    }else{
        console.log("Pole już jest zajętę")
    }
})

app.put('/:gameId', function (req, res) {
    //example puta => 
    //curl -d "diagonal=0&vertical=0&value=2" -H "Content-Type: application/x-www-form-urlencoded" -X PUT http://localhost:3000/53908693-2619-4be0-b679-502d6700a32f
    let gameId = req.params.gameId
    if(games[gameId][req.body.vertical][req.body.diagonal]!=0){
        games[gameId][req.body.vertical][req.body.diagonal] = req.body.value
        printGame(games[gameId])
        console.log("Wartość pola ",req.body.vertical,":",req.body.diagonal," jest zmieniona na ",req.body.value )
    }else{
        console.log("Pole jest równe 0")
    }
    res.send("")
})

app.delete('/:gameId', function (req, res) {
    //example puta => 
    //curl -d "diagonal=0&vertical=0" -H "Content-Type: application/x-www-form-urlencoded" -X PUT http://localhost:3000/53908693-2619-4be0-b679-502d6700a32f
    let gameId = req.params.gameId
    if(games[gameId][req.body.vertical][req.body.diagonal]!=0){
        games[gameId][req.body.vertical][req.body.diagonal] = 0
        printGame(games[gameId])
        console.log("Pole",req.body.vertical,":",req.body.diagonal,"deleted.")
    }else{
        console.log("Pole jest równe 0")
    }
    res.send("")
})


app.listen(/*3000*/8080, function () {
    console.log('Example app listening on port 3000.');
});