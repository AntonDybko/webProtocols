var express = require('express');
var app = express();
//var User = require('./app/models/user')
var cors = require('cors')
var neo4j = require('neo4j-driver');
//const { auth } = require('express-openid-connect');
//const httpServer = require("http").createServer(app); //testing
//var port     = process.env.PORT || 8080;
//var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
require('dotenv').config();
//console.log(process.env)//test

var driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'test1234')); 
//var neo_session =  driver.session();

//require('./config/passport')(passport, neo_session); // pass passport for configuration

app.use(morgan('dev')); 
app.use(cookieParser()); 
app.use(bodyParser());
app.set('view engine', 'ejs');
app.use(cors());

app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); 
//app.use(passport.initialize());
//app.use(passport.session()); 
app.use(flash());
require('./app/routes.js')(app, driver/*, passport*/);



const port = 3000;
app.listen(port);
console.log(`Listening to port ${port}`);