const { _  }= require('underscore');
const { v4: uuidv4 } = require('uuid');
module.exports = {
    getallZamowieniaOfUser: function(_id, neo_driver){
        const neo_session = neo_driver.session()
        return neo_session.run(
            "MATCH (user:User {_id: $_id})-[r:ORDER]->(z:Zamowienie) RETURN z",
            {
                _id: _id
            }
        ).then(results => {
            const zamowienia = []
            results.records.forEach(record => {
                console.log("record: ",record)
                zamowienia.push(_.get(record.get('z'), 'properties'))
                console.log(zamowienia)
            })
            return zamowienia
        }).catch(err => console.log(err))
    },
    getZamowienieById: function(_id, neo_driver){
        const neo_session = neo_driver.session()
        return neo_session.run(
            "MATCH (z:Zamowienie {_id: $_id}) RETURN z",
            {
                _id: _id
            }
        ).then(results => {
            return _.get(results.records[0].get('z'), 'properties')
        }).catch(err => console.log(err))
    },
    getallZamowienia: function(neo_driver){
        const neo_session = neo_driver.session()
        return neo_session.run(
            "MATCH (u:User)-[r:ORDER]->(z:Zamowienie) RETURN z"
        ).then(results => {
            const zamowienia = []
            results.records.forEach(record => {
                zamowienia.push(_.get(record.get('z'), 'properties'))
            })
            return zamowienia
        }).catch(err => console.log(err))
    },
    createZamowienie:function(zam_body, user_id, neo_driver){
        //zam_body = { game_id, sposob_dostawy }
        const session = neo_driver.session()
        return session.run('MATCH (user:User {_id: $user_id}), (game:Game {_id: $game_id}) RETURN user, game', {
            user_id: user_id,
            game_id: zam_body.game_id,
        }).then(results=>{
            console.log(_.get(results.records[0].get('game'), 'properties'));
            console.log(_.get(results.records[0].get('user'), 'properties'));
            let total_price = _.get(results.records[0].get('game'), 'properties').price
            console.log(zam_body.sposob_dostawy)
            if(zam_body.sposob_dostawy === 'fast'){
                total_price = total_price + 10
            }
            if(zam_body.sposob_dostawy)
            if(_.get(results.records[0].get('game'), 'properties') != undefined && _.get(results.records[0].get('user'), 'properties') != undefined){
                return session.run('CREATE (z:Zamowienie {_id: $_id, user_id: $user_id, status: $status, sposob_dostawy: $sposob_dostawy, gameId: $gameId, gameTitle: $gameTitle, gamePrice: $gamePrice, address: $address}) RETURN z', {
                    _id: uuidv4(),
                    status: 'PENDING',
                    gameId: zam_body.game_id,
                    user_id: user_id,
                    sposob_dostawy: zam_body.sposob_dostawy,
                    gameTitle: _.get(results.records[0].get('game'), 'properties').title,
                    gamePrice: total_price,
                    address: _.get(results.records[0].get('user'), 'properties').address
                }).then(z=>{
                    return session.run('MATCH (user:User {_id: $user_id}), (z:Zamowienie {_id: $order_id}) CREATE (user)-[r:ORDER]->(z) RETURN z', {
                        user_id: user_id,
                        order_id: _.get(z.records[0].get('z'), 'properties')._id
                    }).then(()=>{
                        return 'success'
                    })
                })
            }else{
                return 'failure'
            }
        })
    },
    changeStatusOfZamowienie:function(zamowienie_id, newStatus, neo_driver){
        const session = neo_driver.session()
        return session.run('MATCH (z:Zamowienie {_id: $zamowienie_id}) SET z.status=$newStatus RETURN z', {
            zamowienie_id: zamowienie_id,
            newStatus: newStatus,
        }).then(results=>{
            console.log(_.get(results.records[0].get('z'), 'properties'))
            if(_.get(results.records[0].get('z'), 'properties') != undefined) return 'success'
            else return 'failure'
        })
    }
}