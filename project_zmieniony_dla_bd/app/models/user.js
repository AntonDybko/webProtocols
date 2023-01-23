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
                    return session.run('CREATE (user:User {_id: $id, login: $email, email: $email, password: $password, address: "", phone: "", favourite: [], role: "BASIC"}) RETURN user', 
                    {
                        id: uuidv4(),
                        email: email,
                        password: bcrypt.hashSync(password, bcrypt.genSaltSync(8), null),
                        /*api_key: randomstring.generate({
                            length: 60,
                            charset: 'hex'
                        })*/
                    }).then(results => {
                        return _.get(results.records[0].get('user'), 'properties');
                    })
                }
            })//.catch(err=> console.log(err));
    },

    /*me:function(session, apiKey) {
        return session.run('MATCH (user:User {api_key: $api_key}) RETURN user', {
                api_key: apiKey
            })
            .then(results => {
                if (_.isEmpty(results.records)) {
                    throw {
                        error: 'invalid authorization key',
                        status: 401
                    };
                }
                //return new User(results.records[0].get('user'));
                return results.records[0].get('user');
            });
    },*/
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
                    var dbUser = _.get(results.records[0].get('user'), 'properties');
                    if (! bcrypt.compareSync(password, dbUser.password)) {
                        throw {
                            error: 'wrong password',
                            status: 400
                        }
                    }else return dbUser
                    /*const new_key =randomstring.generate({
                        length: 60,
                        charset: 'hex'
                    })
                    return await session.run("MATCH (user:User) WHERE ID(user)=$userId SET user.api_key = $new_key RETURN user", {
                        userId: dbUser.id,
                        new_key: new_key
                    }).then(()=>{
                        return { 
                            id: dbUser.id,
                            email: dbUser,
                            api_key: new_key 
                        }
                    })*/
                    //return { token: new_key }
                    /*return {
                        token: _.get(dbUser, 'api_key')
                    };*/
                }
            });
    },

}