var Game = require('../app/models/game.js');
const { _  }= require('underscore');
const { v4: uuidv4 } = require('uuid');
module.exports = {
    addGame: function(gameBody, neo_driver){
        const neo_session = neo_driver.session()
        return neo_session.run(
            "CREATE (game:Game{_id: $id, title: $title, publisher: $publisher, release_date: $release_date, genre: $genre, short_description: $short_description, price: $price}) RETURN game",
            {   
                id: uuidv4(),
                title: gameBody.title,
                publisher: gameBody.publisher,
                genre: gameBody.genre,
                release_date: gameBody.release_date,
                short_description: gameBody.short_description,
                price: gameBody.price
            }
        ).then((results)=>{
            console.log(gameBody.title + " saved to games store.")
            return _.get(results.records[0].get('game'), 'properties');
        })
    },
    updateGame:function(game_id, body, neo_driver){
        const neo_session = neo_driver.session()
        return neo_session.run(
            "MATCH (game:Game {_id: $id}) SET game.title=$title, game.publisher=$publisher, game.release_date=$release_date, game.genre=$genre, game.short_description=$short_description, game.price=$price RETURN game",
            {   
                id: game_id,
                title: body.title,
                publisher: body.publisher,
                release_date: body.release_date,
                genre: body.genre,
                short_description: body.short_description,
                price: body.price
            }
        ).then((results)=>{
            console.log(body.name + " saved to games store.");
            console.log(_.get(results.records[0].get('game'), 'properties'));
            return _.get(results.records[0].get('game'), 'properties');
        })
    },
    getGamesInArray:function(neo_driver){
        const neo_session = neo_driver.session()
        return neo_session.run("MATCH (game:Game) RETURN game")
        .then(results => {
            const games = []
            results.records.forEach(record => {
                games.push(_.get(record.get('game'), 'properties'))
            })
            return games
        })
    }
}