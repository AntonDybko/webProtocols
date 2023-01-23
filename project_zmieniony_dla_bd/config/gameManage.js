var Game = require('../app/models/game.js');
const { _  }= require('underscore');
const { v4: uuidv4 } = require('uuid');
module.exports = {
    addGame: function(gameBody, neo_driver){
        const neo_session = neo_driver.session()
        return neo_session.run(
            "CREATE (game:Game{_id: $id, name: $name, author: $author, date: $date, description: $description, price: $price}) RETURN game",
            {   
                id: uuidv4(),
                name: gameBody.name,
                author: gameBody.author,
                date: gameBody.date,
                description: gameBody.description,
                price: gameBody.price
            }
        ).then((results)=>{
            console.log(gameBody.name + " saved to games store.")
            return _.get(results.records[0].get('game'), 'properties');
        })
    },
    updateGame:function(game_id, body, neo_driver){
        const neo_session = neo_driver.session()
        return neo_session.run(
            "MATCH (game:Game {_id: $id}) SET game.name=$name, game.author=$author, game.date=$date, game.description=$description, game.price=$price RETURN game",
            {   
                id: game_id,
                name: body.name,
                author: body.author,
                date: body.date,
                description: body.description,
                price: body.price
            }
        ).then((results)=>{
            console.log(body.name + " saved to games store.");
            console.log(_.get(results.records[0].get('game'), 'properties'));
            return _.get(results.records[0].get('game'), 'properties');
        })
        /*Game.updateOne({_id: game_id}, {
            author: body.author,
            description: body.description
        }, function(err, docs){
            if (err){
                console.log(err)
            }
            else{
                console.log("Updated Docs : ", docs);
            }
        })*/
    }
}