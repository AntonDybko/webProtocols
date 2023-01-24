const gameManage = require("../config/gameManage");
var Game = require('../app/models/game.js');
var User = require('../app/models/user.js');
var permissions = require('./permissions.js');
const userManage = require("../config/userManage");
var jwt = require('jsonwebtoken');
//var randomstring = require("randomstring");
const { _  }= require('underscore');
var bcrypt = require('bcryptjs');
//const e = require("connect-flash");
//const server = require("../server");
//const { get, result } = require("underscore");
//const { requiresAuth } = require('express-openid-connect')

//cannot use req.params in git requests, nee dto use req.query!!!!!!!!

module.exports = function(app, passport, neo_driver) {
    app.get('/', function(req, res) {
        //console.log(req.user)
        if(req.cookies.accessToken === undefined){
            res.render('index.ejs');
        }else{
            res.redirect('/main')
        }
    });
    app.get('/login', function(req, res) {
        const error = req.query.error
        if(error != undefined) {
            res.render('login.ejs', { message: error });
        }
        else {
            res.render('login.ejs', { message: "" });
        }
    });
    app.get('/signup', function(req, res) {
        const error = req.query.error
        if(error != undefined) {
            res.render('signup.ejs', { message: error });
        }
        else {
            res.render('signup.ejs', { message: "" });
        }
    });
    app.get('/logout', function(req, res) {
        res.clearCookie("_id");
        res.clearCookie("accessToken");
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
    app.get('/profile', isLoggedIn, async function(req, res) {
        res.render('users/profile.ejs')
    });
    app.get('/edit_profile', isLoggedIn, async function(req, res) {
        if (req.query.error != undefined){
            res.locals.error = req.query.error
        }else{
            res.locals.error = ""
        }
        res.render('users/edit_profile.ejs')
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

    /*app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });*/
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
        //const api_key = req.cookies.x_api_key;
        const _id = req.cookies._id;
        if(_id != undefined && token !=undefined){
            const neo_session = neo_driver.session()
            neo_session.run(
                "MATCH (user:User {_id: $_id}) RETURN user",
                {_id: _id}
            ).then((result) => {
                const user = _.get(result.records[0].get('user'), 'properties')
                const api_key = user.api_key
                jwt.verify(token, api_key, (err, user) =>{
                    if (err) res.redirect('/logout');
                    else{
                        res.locals.user ={
                            _id: user._id,
                            login: user.login,
                            email: user.email,
                            address: user.address,
                            phone: user.phone,
                            role: user.role,
                            favourite: user.favourite
                        } 
                        return next();
                    } 
                })
            })
        }else{
            res.redirect('/logout')
        }

    }

    app.post('/signup', function(req, res){
        passport.register(neo_session, req.body.email, req.body.password).then(user =>{
            const key = user.api_key
            const accessToken = jwt.sign(user, key, { expiresIn: '1d'})

            res.cookie('accessToken', accessToken)
            res.cookie('_id', user._id)

            res.redirect('/main')
        }).catch((err)=>{
            console.log(err)
            res.redirect(`/signup?error=${err.error}`)

        })
    });
    app.post('/login', function(req, res){

        passport.login(neo_driver, req.body.email, req.body.password).then(user =>{
            console.log("login form user:", user)
            const key = user.api_key
            const accessToken = jwt.sign(user, key, { expiresIn: '1d'})

            res.cookie('accessToken', accessToken)
            res.cookie('_id', user._id)
            
            res.redirect('/main')
        }).catch((err)=>{
            console.log("err in /login", err)
            res.redirect(`/login?error=${err.error}`)
        })
    });

    app.post('/edit_profile', isLoggedIn, async function(req, res) {
        //if(req.body.password != undefined){
        console.log(req.body)
        if(req.body.password === req.body.password_2){
            const neo_session = neo_driver.session()
            neo_session.run(
                "MATCH (user:User {_id: $_id}) RETURN user",
                {_id: req.cookies._id}
            ).then(result => {
                if(bcrypt.compareSync(req.body.password, _.get(result.records[0].get('user'), 'properties').password)){
                    neo_session.run(
                        "MATCH (user:User {_id: $_id}) SET user.login=$newLogin, user.email=$newEmail, user.address=$newAddress, user.phone=$newPhone RETURN user",
                        {
                            _id: req.cookies._id,
                            newLogin: req.body.login,
                            newEmail: req.body.email,
                            newAddress: req.body.address,
                            newPhone: req.body.phone
                        }
                    ).then((user)=>{
                        const newUser = _.get(user.records[0].get('user'), 'properties')
                        console.log(newUser)
                        const newAccessToken = jwt.sign(newUser, newUser.api_key, { expiresIn: '1d'})
                        res.cookie('accessToken', newAccessToken)
                        res.redirect('/profile')
                    }).catch((error)=>{
                        console.log(error)
                    })
                }else{
                    let error="Wrong password"
                    res.redirect(`/edit_profile?error=${error}`)
                }
            }).catch((err)=>{
                console.log(err)
            })
        }else{
            let error = "Passwords are not equal"
            res.redirect(`/edit_profile?error=${error}`)
        }
        //}
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