var Game = require('../app/models/game.js');
module.exports = {
    addGame:function(gameBody){
        const newGame = new Game({
            name: gameBody.name,
            author: gameBody.author,
            date: gameBody.date,
            description: gameBody.description
        });
        console.log(newGame.name)
        newGame.save(function(err, game) {
            if (err)
                throw err;
            console.log(game.name + " saved to games store.")
        });
    },
    updateGame:function(game_id, body){
        Game.updateOne({_id: game_id}, {
            author: body.author,
            description: body.description
        }, function(err, docs){
            if (err){
                console.log(err)
            }
            else{
                console.log("Updated Docs : ", docs);
            }
        })
    }
}