const gameManage = require("../config/gameManage");
var Game = require('../app/models/game.js');
var User = require('../app/models/user.js');
var permissions = require('./permissions.js');
const userManage = require("../config/userManage");
var jwt = require('jsonwebtoken');
var randomstring = require("randomstring");
const { _  }= require('underscore');
//const e = require("connect-flash");
//const server = require("../server");
//const { get, result } = require("underscore");
//const { requiresAuth } = require('express-openid-connect')

//cannot use req.params in git requests, nee dto use req.query!!!!!!!!

module.exports = function(app, passport, neo_driver) {
    app.get('/', function(req, res) {
        //console.log(JSON.stringify(req.headers))
        //console.log(req.header('x-api-key'))
        console.log(req.cookies.x_api_key)
        if(req.user===undefined || res.logout != undefined){
            res.render('index.ejs');
        }else{
            res.redirect('/main')
        }
    });
    app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
        //res.render('login.ejs', { message: req.flash('loginMessage') });
        const error = req.query.error
        // render the page and pass in any flash data if it exists
        if(error != undefined) {
            res.render('login.ejs', { message: error });
        }
        else {
            res.render('login.ejs', { message: "" });
        }
    });
    app.get('/signup', function(req, res) {
        const error = req.query.error
        // render the page and pass in any flash data if it exists
        if(error != undefined) {
            res.render('signup.ejs', { message: error });
        }
        else {
            res.render('signup.ejs', { message: "" });
        }
    });
    app.get('/logout', function(req, res) {
        res.clearCookie("x_api_key");
        req.session.destroy(function(){
            res.redirect('/')
        })
    });
    app.get('/main', isLoggedIn, async function(req, res) {
        const neo_session = neo_driver.session()
        neo_session.run("MATCH (game:Game) RETURN game")
        .then(results => {
            const games = []
            results.records.forEach(record => {
                games.push(_.get(record.get('game'), 'properties'))
            })
            res.render('main.ejs',{
                gamesList: games,
            })
        })
    });

    //games
    app.get('/manageGames',isLoggedIn, permissions.isAdmin, function(req, res) {
        res.render('games/manageGames.ejs'); //?????
    });
    app.get('/addGame', isLoggedIn, permissions.isAdmin, function(req, res) { 
        res.render('games/addGame.ejs'); //?????
    });
    app.get('/listOfGames', isLoggedIn, permissions.isAdmin, function(req, res) {
        const neo_session = neo_driver.session()
        neo_session.run("MATCH (game:Game) RETURN game")
        .then(results => {
            const games = []
            results.records.forEach(record => {
                games.push(_.get(record.get('game'), 'properties'))
            })
            res.render('games/listOfGames.ejs',{
                gamesList: games,
            })
        })
    });

    app.get('/updateGame/:game_id',isLoggedIn, permissions.isAdmin, function(req, res) { //?...
        const game_id = req.params.game_id.replace('.', '')
        const neo_session = neo_driver.session()
        neo_session.run("MATCH (game:Game {_id: $game_id}) RETURN game", { game_id: game_id})
        .then(results => {
            res.render('games/updateGame.ejs',{
                game: _.get(results.records[0].get('game'), 'properties')
            }); 
        })
    });
    app.delete('/removeGame',isLoggedIn, permissions.isAdmin, function(req, res) { //restfull delete
        console.log("removegame?")
        const neo_session = neo_driver.session()
        //const second_neo_session = neo_driver.session()
        const game_id = req.query.game_id.replace('.', '')
        neo_session.run("MATCH (game:Game {_id: $game_id})-[r:COMMENT]->() DELETE r", { game_id: game_id}).then(()=>{
            console.log("clear COMMENT dependencies")
            neo_session.run("MATCH ()-[r:ZAMOWIENIE]->(game:Game {_id: $game_id}) DELETE r", { game_id: game_id}).then(results=>{
                console.log("clear ZAMOWIENIE dependencies")
                neo_session.run("MATCH (game:Game {_id: $game_id}) DELETE game", { game_id: game_id}).then(results=>{
                    console.log("DELETE game")
                    res.status(204).json(null)
                }).catch(function(error){
                    console.log(error);
                })
            }).catch(function(error){
                console.log(error);
            })
        }).catch(function(error){
            console.log(error);
        })
        /*await neo_session.run("MATCH (game:Game {id: $game_id})-[r:COMMENT]->() DELETE r", { game_id: game_id}).then(()=>{
        }).catch(function(error){
            console.log(error);
        })
        await neo_session.run("MATCH ()-[r:ZAMOWIENIE]->(game:Game {id: $game_id}) DELETE r, game RETURN game", { game_id: game_id}).then(results=>{
            console.log(results.records)
            res.status(204).json(null)
        }).catch(function(error){
            console.log(error);
        }) */
    });
    app.get('/gameInfo/:game_id',isLoggedIn, function(req, res) {
        const game_id = req.params.game_id.replace('.', '')
        Game.findOne({_id: game_id}, function(err, game){
            User.findOne({_id: req.user._id}, function(err, user){
                res.render('games/gameInfo.ejs',{
                    game: game,
                    u_library: user.library
                }); 
            })
        })
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    app.get('/library',isLoggedIn, function(req, res){
        const yourGames = []
        if(req.user.library.length===0){
            res.render('library.ejs',{
                yourGames: [],
            })
        }else{
            req.user.library.forEach( game_id => {
                Game.findOne({ _id: game_id }, function(err, game){
                    if(err){
                        console.log("error"+err)
                    }else{
                        yourGames.push(game)
                        if(yourGames.length===req.user.library.length){
                            res.render('library.ejs',{
                                yourGames: yourGames,
                            })
                        }
                    }

                })
            })
        }

    });
    app.delete('/removeFromLibrary/:game_id', isLoggedIn, function(req, res) { //restfull delete
        const game_id = req.params.game_id.replace('.', '')
        console.log(game_id)
        userManage.removeFromLibrary(game_id, req.user._id)
        //res.redirect('/library');
        res.status(204).send("successfully remove from library")

    });



    async function isLoggedIn(req, res, next){
        const token = req.cookies.accessToken
        console.log("authHeader: ",token)
        const api_key = req.cookies.x_api_key;
        if(api_key != undefined && token !=null){
            jwt.verify(token, api_key, (err, user) =>{
                if (err) res.redirect('/');
                else{
                    res.locals.user = user
                    return next();
                } 
            })
        }else{
            res.redirect('/')
        }

    }
    /*async function isLoggedIn(req, res, next){
        const token = req.cookies.accessToken
        console.log("authHeader: ",token)
        const api_key = req.cookies.x_api_key;
        if(api_key != undefined && token !=null){
            neo_session.run("MATCH (user:User {api_key: $api_key}) RETURN user",{ api_key: api_key}).then((result)=>{
                //if (result.records !=)
                console.log(result.records)
                if(result.records.length !=0){
                    jwt.verify(token, api_key, (err, user) =>{
                        if (err) res.redirect('/');
                        else return next();
                    })
                }else{
                    res.redirect('/')
                }
            })
        }else{
            res.redirect('/')
        }

    }*/
    app.post('/signup', function(req, res){
        passport.register(neo_session, req.body.email, req.body.password).then(user =>{
            const key = randomstring.generate({
                length: 60,
                charset: 'hex'
            })
            const accessToken = jwt.sign(user, key, { expiresIn: '1d'})

            res.cookie('accessToken', accessToken)
            //res.cookie('x_api_key', user.api_key)
            res.cookie('x_api_key', key)

            res.redirect('/main')
        }).catch((err)=>{
            console.log(err)
            res.redirect(`/signup?error=${err.error}`)

        })
    });
    app.post('/login', function(req, res){

        passport.login(neo_driver, req.body.email, req.body.password).then(user =>{
            const key = randomstring.generate({
                length: 60,
                charset: 'hex'
            })

            const accessToken = jwt.sign(user, key, { expiresIn: '1d'})

            //res.cookie('x_api_key', user.api_key)
            res.cookie('accessToken', accessToken)
            res.cookie('x_api_key', key)
            
            res.redirect('/main')
        }).catch((err)=>{
            console.log(err)
            res.redirect(`/login?error=${err.error}`)
        })
    });

    
    app.post('/addGame',isLoggedIn, permissions.isAdmin, function(req, res){ 
        gameManage.addGame(req.body, neo_driver).then(()=>{
            res.redirect('/manageGames');
        })
    });
    app.put('/updateGame',isLoggedIn, permissions.isAdmin, function(req, res) { //restfull put
        const game_id = req.query.game_id.replace('.', '')
        gameManage.updateGame(game_id, req.body, neo_driver).then(()=>{
            res.status(200).json(req.body);
        })
        //res.redirect('/listOfGames');
        //res.status(200).json(req.body);
    });

    app.get('/searchByName',isLoggedIn, function(req, res){
        Game.find({"name": { $regex: `${req.query.wzorec}`}}, function(err, games){
            res.render('games/searchedGames.ejs',{
                games: games,
                user: {
                    _id: req.user._id,
                    email: req.user.email,
                    library: req.user.library,
                    role: req.user.role 
                }
            })
        })
    });
    //user posts
    app.put('/addToLibrary/:game_id',isLoggedIn, function(req, res){ //restfull put
        const game_id = req.params.game_id.replace('.', '')
        userManage.addToLibrary(game_id, req.user)
        //res.redirect('/library')
        res.status(200).send('successfully added to library')
    });
    

}