var User = require('../app/models/user.js');
module.exports = {
    addToLibrary:function(game_id, user){
        User.findOneAndUpdate(
            {_id: user._id}, 
            {$addToSet: {library: game_id}}, 
            function(err, success){
            if (err){
                console.log(err)
            }
            else{
                console.log(success);
            }
        })
    },
    removeFromLibrary:function(game_id, user_id){
        User.updateOne(
            {_id: user_id}, 
            {$pull: {library: game_id}}, 
            function(err, success){
            if (err){
                console.log(err)
            }
            else{
                console.log(success);
            }
        })
    }
};