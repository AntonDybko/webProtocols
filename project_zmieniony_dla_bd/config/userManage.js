const { v4: uuidv4 } = require('uuid');
const { _  }= require('underscore');
var bcrypt = require('bcryptjs');
var randomstring = require("randomstring");
module.exports = {
    register:function(neo_driver, email, password) {
        const session = neo_driver.session()
        return session.run('MATCH (user:User {email: $email}) RETURN user', {
                email: email
            })
            .then(results => {
                if (!_.isEmpty(results.records)) {
                    throw {
                        error: 'email already in use',
                        status: 400
                    }
                }
                else {
                    return session.run('CREATE (user:User {_id: $id, login: $email, email: $email, password: $password, api_key: $api_key, address: "", phone: "", role: "BASIC"}) RETURN user', 
                    {
                        id: uuidv4(),
                        email: email,
                        password: bcrypt.hashSync(password, bcrypt.genSaltSync(8), null),
                        api_key: randomstring.generate({
                            length: 60,
                            charset: 'hex'
                        })
                    }).then(results => {
                        let dbUser = _.get(results.records[0].get('user'), 'properties');
                        console.log(dbUser)
                        return dbUser
                    })
                }
            })
    },
    login: async function(neo_driver, email, password) {
        const session = neo_driver.session()
        return await session.run('MATCH (user:User {email: $email}) RETURN user', {
            email: email
            })
            .then(async results => {
                if (_.isEmpty(results.records)) {
                    throw {
                        error: 'email does not exist',
                        status: 400
                    }
                }
                else {
                    let dbUser = _.get(results.records[0].get('user'), 'properties');
                    if (! bcrypt.compareSync(password, dbUser.password)) {
                        throw {
                            error: 'wrong password',
                            status: 400
                        }
                    }
                    const new_key =randomstring.generate({
                        length: 60,
                        charset: 'hex'
                    })
                    return await session.run("MATCH (user:User) WHERE user._id=$userId SET user.api_key = $new_key", {
                        userId: dbUser._id,
                        new_key: new_key
                    }).then(()=>{
                        dbUser.api_key = new_key
                        return dbUser
                    })
                }
            });
    },
    addToFavourite:function(game_id, user_id, neo_driver){
        const session = neo_driver.session()
        console.log(game_id, user_id)
        return session.run('MATCH (user:User), (game:Game) WHERE user._id=$user_id AND game._id=$game_id CREATE (user)-[r:FAVOURITE]->(game) RETURN r', {
            user_id: user_id,
            game_id: game_id
        }).then(() => {
            return 'success'
        })
    },
    removeFromFavourite:function(game_id, user_id, neo_driver){
        const session = neo_driver.session()
        return session.run('MATCH (user:User)-[r:FAVOURITE]->(game:Game) WHERE user._id=$user_id AND game._id=$game_id DELETE r RETURN r', {
            user_id: user_id,
            game_id: game_id
        }).then(() => {
            return 'success'
        })

    },
    getFavouriteGames:function(user_id, neo_driver){
        const session = neo_driver.session()
        return session.run('MATCH (user:User)-[r:FAVOURITE]->(game:Game) WHERE user._id=$user_id RETURN game', {
            user_id: user_id,
        }).then(games => {
            const result = []
            games.records.forEach(game => {
                result.push( _.get(game.get('game'), 'properties'));
            })
            return result
        })
    },
};