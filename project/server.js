var express  = require('express');
var app      = express();
//var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

//var configDB = require('./config/database.js');
mongoose.set("strictQuery", false); //test
mongoose.connect("mongodb://localhost:27017/gameStore", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
//test
const contactSchema = {
    email: String,
    query: String,
}; 
//const Contact = mongoose.model("Contact", contactSchema);

require('./config/passport')(passport); // pass passport for configuration

app.use(morgan('dev')); 
app.use(cookieParser()); 
app.use(bodyParser());
app.set('view engine', 'ejs');

app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); 
app.use(passport.initialize());
app.use(passport.session()); 
app.use(flash());
require('./app/routes.js')(app, passport);

const port = 3001;
app.listen(port);
console.log(`Listening to port ${port}`);