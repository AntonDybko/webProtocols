var mongoose = require('mongoose');
//var bcrypt   = require('bcrypt-nodejs');
//var bcrypt   = require('bcryptjs');

// define the schema for our user model
var gameSchema = mongoose.Schema({
    name: String,
    author: String,
    date: Date,
    description: String

});
//userTable=mongoose.model('users',userSchema);


// create the model for users and expose it to our app
module.exports = mongoose.model('Game', gameSchema);