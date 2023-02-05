const { _  }= require('underscore');
const { v4: uuidv4 } = require('uuid');
module.exports = {
    addGame: function(gameBody, neo_driver){
        const neo_session = neo_driver.session()
        return neo_session.run("MATCH (game:Game) RETURN game")
        .then(results => {
            const games = []
            results.records.forEach(record => {
                games.push(_.get(record.get('game'), 'properties').title)
            })
            if(!games.includes(gameBody.title)){
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
            }else{
                console.log('game exists in db') // test console.log
                return null
            }
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
    },
    filterGamesByTitle:function(title, neo_driver){
        const neo_session = neo_driver.session()
        return neo_session.run(
        'MATCH (game:Game) WHERE game.title =~ $wzorec RETURN game', { wzorec: `.*${title}.*`}
        ).then(results => {
            const games = []
            results.records.forEach(record => {
                games.push(_.get(record.get('game'), 'properties'))
            })
            return games
        })
    },
    filterGamesByPublisher:function(publisher, neo_driver){
        const neo_session = neo_driver.session()
        let wzorec = publisher
        if(wzorec === ''){
            wzorec = '^.*$'
        }
        return neo_session.run(
        'MATCH (game:Game) WHERE game.publisher =~ $publisher RETURN game', { publisher: wzorec}
        ).then(results => {
            const games = []
            results.records.forEach(record => {
                games.push(_.get(record.get('game'), 'properties'))
            })
            return games
        })
    },
    filterGamesByGenre:function(genre, neo_driver){
        const neo_session = neo_driver.session()
        let wzorec = genre
        if(wzorec === ''){
            wzorec = '^.*$'
        }
        return neo_session.run(
        'MATCH (game:Game) WHERE game.genre =~ $genre RETURN game', { genre: wzorec}
        ).then(results => {
            const games = []
            results.records.forEach(record => {
                games.push(_.get(record.get('game'), 'properties'))
            })
            return games
        })
    },
    findGameById:function(id, neo_driver){
        const neo_session = neo_driver.session()
        return neo_session.run(
        'MATCH (game:Game) WHERE game._id = $_id RETURN game', { _id: id}
        ).then(results => {
            return _.get(results.records[0].get('game'), 'properties')
        })
    },
    getReviewsToGame:function(game_id, neo_driver){
        const neo_session = neo_driver.session()
        return neo_session.run(
            'MATCH (user:User)-[r:REVIEW]->(game:Game) WHERE game._id=$_id RETURN user, r',{
                _id: game_id
            }
        ).then(reviews=>{
            const gamereviews = []
            reviews.records.forEach(review => {
                let current_review = _.get(review.get('r'), 'properties')
                current_review.authorLogin = _.get(review.get('user'), 'properties').login
                gamereviews.push(current_review)
                console.log(current_review) //test console.log
            })
            return gamereviews
        })
    },
    addReviewToGame:function(game_id, user_id, reviewBody, neo_driver){
        const neo_session = neo_driver.session()
        return neo_session.run(
            'MATCH (user:User {_id: $user_id}), (game:Game {_id: $game_id}) CREATE (user)-[r:REVIEW {_id: $review_id, authorId: $authorId, mark: $mark, text: $text}]->(game)',{
                game_id: game_id,
                user_id: user_id,
                review_id: uuidv4(),
                authorId: reviewBody.authorId,
                mark: reviewBody.mark,
                text: reviewBody.text
            }
        ).then(()=>{
            return 'success'
        })
    },
    removeReview:function(game_id, review_id, review_author_id, user_id, neo_driver){
        const neo_session = neo_driver.session()
        return neo_session.run(
            'MATCH (user:User)-[r:REVIEW]->(game:Game) WHERE user._id=$user_id AND game._id=$game_id AND r._id=$review_id RETURN r',{
                game_id: game_id,
                user_id: user_id,
                review_id: review_id
            }
        ).then(reviews=>{
            if(reviews.records.length != 0){
                return neo_session.run(
                    'MATCH (user:User)-[r:REVIEW]->(game:Game) WHERE user._id=$user_id AND game._id=$game_id AND r._id=$review_id DELETE r',{
                        game_id: game_id,
                        user_id: user_id,
                        review_id: review_id
                    }
                ).then(()=>{
                    return 'success'
                })
            }else{
                return neo_session.run('MATCH (user:User {_id: $userId}) RETURN user',{ userId: user_id}).then((user)=>{
                    const currUser = _.get(user.records[0].get('user'), 'properties')
                    if(currUser.role==='ADMIN'){
                        return neo_session.run(
                            'MATCH (user:User)-[r:REVIEW]->(game:Game) WHERE user._id=$review_author_id AND game._id=$game_id AND r._id=$review_id DELETE r',{
                                game_id: game_id,
                                review_author_id: review_author_id,
                                review_id: review_id
                            }
                        ).then(()=>{
                            return 'success'
                        })
                    }else{
                        return 'failure'
                    }
                })
            }
        })
    },
    removeGame:function(game_id, neo_driver){
        const neo_session = neo_driver.session()
        return neo_session.run("MATCH ()-[r:REVIEW]->(game:Game {_id: $game_id}) DELETE r", { game_id: game_id}).then(()=>{
            console.log("clear REVIEW dependencies")
            return neo_session.run("MATCH ()-[r:FAVOURITE]->(game:Game {_id: $game_id}) DELETE r", { game_id: game_id}).then(results=>{
                console.log("clear FAVOURITE dependencies")
                return neo_session.run("MATCH (game:Game {_id: $game_id}) DELETE game", { game_id: game_id}).then(results=>{
                    console.log("DELETE game")
                    return 'success'
                }).catch(function(error){
                    console.log(error);
                    return error
                })
            }).catch(function(error){
                console.log(error);
                return error
            })
        }).catch(function(error){
            console.log(error);
            return error
        })
    },
}