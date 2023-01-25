const { _  }= require('underscore');
//const { v4: uuidv4 } = require('uuid');
module.exports = {
    getallZamowieniaOfUser: function(_id, neo_driver){
        const neo_session = neo_driver.session()
        neo_session.run(
            "MATCH (user:User {_id: $_id})-[r:zamowienie]->(game:Game) RETURN r",
            {
                _id: _id
            }
        ).then(results => {
            const zamowienia = []
            results.records.forEach(record => {
                console.log("record: ",record)
                games.push(_.get(record.get('zamowienie'), 'properties'))
            })
            return zamowienia
        }).catch(err => console.log(err))
    },
}