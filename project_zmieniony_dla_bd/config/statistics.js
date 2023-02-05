const { _  }= require('underscore');
//const { v4: uuidv4 } = require('uuid');
module.exports = {
    popularityByAmountOfComments: function(neo_driver){
        const neo_session = neo_driver.session()
        return neo_session.run(
            'MATCH (game:Game) RETURN game'
            ).then(async games=>{
                const game_idTitles = []
                const gamesByComments = []
                games.records.forEach(game=>{
                    game_idTitles.push({
                        _id: _.get(game.get('game'), 'properties')._id,
                        title: _.get(game.get('game'), 'properties').title,
                    })
                })
                console.log(game_idTitles) //test console.log
                console.log('that was game_idTitles') //test console.log
                for (const idTitle of game_idTitles){
                    await neo_session.run(
                        'MATCH (user:User)-[r:REVIEW]->(game:Game) WHERE game._id=$_id RETURN r',{
                            _id: idTitle._id
                        }
                    ).then((results)=>{
                        gamesByComments.push({
                            _id: idTitle._id,
                            title: idTitle.title,
                            comments: results.records.length
                        })
                    })
                }
                gamesByComments.sort((a, b) =>{
                    if(a.comments < b.comments){
                        return 1
                    }
                    if(a.comments > b.comments){
                        return -1
                    }
                    return 0
                })
                console.log(gamesByComments) //test console.log
                console.log('gamesByComments') //test console.log
                return gamesByComments
            })
    },
    popularityByFavourites: function(neo_driver){
        const neo_session = neo_driver.session()
        return neo_session.run(
            'MATCH (game:Game) RETURN game'
            ).then(async games=>{
                const game_idTitles = []
                const gamesByFavourites = []
                games.records.forEach(game=>{
                    game_idTitles.push({
                        _id: _.get(game.get('game'), 'properties')._id,
                        title: _.get(game.get('game'), 'properties').title,
                    })
                })
                console.log(game_idTitles) //test console.log
                console.log('that was game_idTitles') //test console.log
                for (const idTitle of game_idTitles){
                    await neo_session.run(
                        'MATCH (user:User)-[r:FAVOURITE]->(game:Game) WHERE game._id=$_id RETURN r',{
                            _id: idTitle._id
                        }
                    ).then((results)=>{
                        gamesByFavourites.push({
                            _id: idTitle._id,
                            title: idTitle.title,
                            favourites: results.records.length
                        })
                    })
                }
                gamesByFavourites.sort((a, b) =>{
                    if(a.favourites < b.favourites){
                        return 1
                    }
                    if(a.favourites > b.favourites){
                        return -1
                    }
                    return 0
                })
                console.log(gamesByFavourites) //test console.log
                console.log('gamesByFavourites') //test console.log
                return gamesByFavourites
            })
    },
    popularityByAmountOfOrders: function(neo_driver){
        const neo_session = neo_driver.session()
        return neo_session.run(
            'MATCH (game:Game) RETURN game'
            ).then(async games=>{
                const game_idTitles = []
                const gamesByOrders= []
                games.records.forEach(game=>{
                    game_idTitles.push({
                        _id: _.get(game.get('game'), 'properties')._id,
                        title: _.get(game.get('game'), 'properties').title,
                    })
                })
                console.log(game_idTitles) //test console.log
                console.log('that was game_idTitles') //test console.log
                for (const idTitle of game_idTitles){
                    await neo_session.run(
                        'MATCH (user:User)-[r:ORDER]->(z:Zamowienie) WHERE z.gameId=$_id RETURN r',{
                            _id: idTitle._id
                        }
                    ).then((results)=>{
                        gamesByOrders.push({
                            _id: idTitle._id,
                            title: idTitle.title,
                            orders: results.records.length
                        })
                    })
                }
                gamesByOrders.sort((a, b) =>{
                    if(a.orders < b.orders){
                        return 1
                    }
                    if(a.orders > b.orders){
                        return -1
                    }
                    return 0
                })
                console.log(gamesByOrders) //test console.log
                console.log('gamesByOrders') //test console.log
                return gamesByOrders
            })
    },
}