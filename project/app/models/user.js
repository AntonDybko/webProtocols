// load the things we need
var mongoose = require('mongoose');
//var bcrypt   = require('bcrypt-nodejs');
var bcrypt   = require('bcryptjs');

const ROLES = {
    ADMIN: "ADMIN",
    MODERATOR: 'MODERATOR',
    BASIC: "BASIC",
    MUTED: "MUTED"
}
// define the schema for our user model
var userSchema = mongoose.Schema({
    email: String,
    library: Array,
    password: String,
    role: String
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;