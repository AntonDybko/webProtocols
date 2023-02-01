const gameManage = require("../config/gameManage");
//var Game = require('../app/models/game.js');
//var permissions = require('./permissions.js');
const userManage = require("../config/userManage");
var jwt = require('jsonwebtoken');
//var randomstring = require("randomstring");
const { _  }= require('underscore');
var bcrypt = require('bcryptjs');
const zamowienieManage = require('../config/zamowienieManage')
//const e = require("connect-flash");
//const server = require("../server");
//const { get, result } = require("underscore");
//const { requiresAuth } = require('express-openid-connect')

//cannot use req.params in git requests, nee dto use req.query!!!!!!!!

module.exports = function(app, neo_driver) {
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
        const games = await gameManage.getGamesInArray(neo_driver);
        console.log(games);
        res.render('main.ejs',{
            gamesList: games,
        })
    });
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('users/profile.ejs')
    });
    app.get('/edit_profile', isLoggedIn, function(req, res) {
        if (req.query.error != undefined){
            res.locals.error = req.query.error
        }else{
            res.locals.error = ""
        }
        res.render('users/edit_profile.ejs')
    });
    app.get('/profile', isLoggedIn,  function(req, res) {
        res.render('users/profile.ejs')
    });
    app.get('/importGamesFromJsonFile', isLoggedIn,  isAdmin, function(req, res) {
        res.render('games/importGamesFromJsonFile.ejs')
    })
    app.get('/exportGamesToJsonFile', isLoggedIn, isAdmin, async function(req, res) {
        const games = await gameManage.getGamesInArray(neo_driver)
        res.status(200).send(games)
    })

    app.get('/historia_zamowien', isLoggedIn, async function(req, res) {
        const zamowienia = await zamowienieManage.getallZamowieniaOfUser(req.cookies._id, neo_driver);
        res.render('users/historiaZamowien.ejs', {
            zamowienia: zamowienia
        })
    })
    app.get('/lista_zamowien', isLoggedIn, isAdmin, async function(req, res) {
        const all_zamowienia = await zamowienieManage.getallZamowienia(neo_driver);
        res.render('users/listaZamowien.ejs', {
            all_zamowienia: all_zamowienia
        })
    })
    app.get('/zamowienie/:game_id', isLoggedIn, function(req, res) {
        const game = gameManage.findGameById(req.params.game_id, neo_driver)
        res.render('users/zamowienie.ejs', {
            game_id: req.params.game_id,
            gameTitle: game.title,
            gamePrice: game.price,
            gamePublisher: game.publisher,
            address: res.locals.user.address
        })
    })
    app.get('/zamowienie/:game_id/payOnline', isLoggedIn, function(req, res) {
        const game = gameManage.findGameById(req.params.game_id, neo_driver)
        res.render('users/payOnline.ejs', {
            game_id: req.params.game_id,
            gameTitle: game.title,
            gamePrice: game.price,
            gamePublisher: game.publisher,
            sposob_dostawy: req.query.sposob_dostawy,
            address: res.locals.user.address
        })
    })
    app.post('/makeZamowienie', isLoggedIn, function(req, res) {
        const user_id = req.cookies._id
        //req.body = { game_id, sposob_dostawy, total_price }
        zamowienieManage.createZamowienie(req.body, user_id, neo_driver).then((zamoweinie)=>{
            res.sendStatus(200)
        }).catch(err=>{
            console.log(err)
        })
    })

    //games
    app.get('/manageGames',isLoggedIn, isAdmin, function(req, res) {
        res.render('games/manageGames.ejs'); //?????
    });
    app.get('/addGame', isLoggedIn, isAdmin, function(req, res) { 
        res.render('games/addGame.ejs'); //?????
    });
    app.get('/listOfGames', isLoggedIn, isAdmin, function(req, res) {
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

    app.get('/updateGame/:game_id',isLoggedIn, isAdmin, function(req, res) { //?...
        const game_id = req.params.game_id.replace('.', '')
        const neo_session = neo_driver.session()
        neo_session.run("MATCH (game:Game {_id: $game_id}) RETURN game", { game_id: game_id})
        .then(results => {
            res.render('games/updateGame.ejs',{
                game: _.get(results.records[0].get('game'), 'properties')
            }); 
        })
    });


    //TUTAJ TRZEBA DOKOŃCZYC!!!!!
    //TUTAJ TRZEBA DOKOŃCZYC!!!!!
    //TUTAJ TRZEBA DOKOŃCZYC!!!!!
    app.delete('/removeGame',isLoggedIn, isAdmin, function(req, res) { //TUTAJ TRZEBA DOKOŃCZYC!!!!!
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
    app.get('/gameInfo/:game_id',isLoggedIn, async function(req, res) {
        const game_id = req.params.game_id.replace('.', '');
        const game = await gameManage.findGameById(game_id, neo_driver);
        const reviews = await gameManage.getComments(game_id, neo_driver)

        const favouriteGames = await userManage.getFavouriteGames(req.cookies._id, neo_driver)
        const gameIds = []
        favouriteGames.forEach(game => gameIds.push(game._id))

        console.log(favouriteGames);
        res.render('games/gameInfo.ejs', {
            game: game,
            reviews: reviews,
            favouriteGames: gameIds
        })
    });
    app.post('/gameInfo/addReviewToGame', isLoggedIn, async function(req, res){
        const game_id = req.query.game_id
        console.log(req.body)
        gameManage.addReviewToGame(game_id, req.cookies._id, req.body, neo_driver).then(()=>{
            res.sendStatus(201)
        }).catch(err=>{
            console.log(err)
        })
    })
    app.delete('/gameInfo/removeReview', isLoggedIn, async function(req, res){
        const game_id = req.query.game_id
        const review_author_id = req.query.review_author_id
        const review_id = req.query.review_id
        gameManage.removeReview(game_id, review_id, review_author_id, req.cookies._id, neo_driver).then((result)=>{
            if(result === 'failure') res.sendStatus(400)
            else res.sendStatus(204)
        }).catch(err=>{
            console.log(err)
        })
    })

    
    //favourite
    app.get('/favourite',isLoggedIn, async function(req, res){
        const favouriteGames = await userManage.getFavouriteGames(req.cookies._id, neo_driver)
        console.log(favouriteGames)
        res.render('users/favourite.ejs',{
            yourGames: favouriteGames,
        })
        

    });
    app.delete('/removeFromFavourite', isLoggedIn, async function(req, res) { //restfull delete
        const game_id = req.query.game_id
        const favouriteGames = await userManage.getFavouriteGames(req.cookies._id, neo_driver)
        const gameIds = []
        favouriteGames.forEach(game => gameIds.push(game._id))
        if(gameIds.includes(game_id)){
            userManage.removeFromFavourite(game_id, req.cookies._id, neo_driver).then((result)=>{
                res.sendStatus(204)
            }).catch(err => {
                console.log(err)
                res.sendStatus(400)
            })
        }else{
            res.sendStatus(400)
        }

    });
    app.put('/addToFavourite',isLoggedIn, async function(req, res){ //restfull put
        const game_id = req.query.game_id
        const favouriteGames = await userManage.getFavouriteGames(req.cookies._id, neo_driver)
        const gameIds = []
        favouriteGames.forEach(game => gameIds.push(game._id))
        if(!gameIds.includes(game_id)){
            userManage.addToFavourite(game_id, req.cookies._id, neo_driver).then((result)=>{
                res.sendStatus(204)
            }).catch(err => {
                console.log(err)
                res.sendStatus(400)
            })
        }else{
            res.sendStatus(400)
        }
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
                        } 
                        return next();
                    } 
                })
            })
        }else{
            res.redirect('/logout')
        }

    }
    function isAdmin(req, res, next){
        const neo_session = neo_driver.session()
        neo_session.run('MATCH (user:User {_id: $userId}) RETURN user',{ userId: req.cookies._id}).then((user)=>{
            const currUser = _.get(user.records[0].get('user'), 'properties')
            if(currUser.role!='ADMIN'){
                res.status(401)
                return res.send('Access is allowed only to administrators')
            }else{
                next()
            }
        })
    }

    app.post('/signup', function(req, res){
        userManage.register(neo_session, req.body.email, req.body.password).then(user =>{
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
        userManage.login(neo_driver, req.body.email, req.body.password).then(user =>{
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

    app.put('/edit_profile', isLoggedIn, function(req, res) {
        if(req.body.password === req.body.password_2){
            const neo_session = neo_driver.session()
            neo_session.run(
                "MATCH (user:User {_id: $_id}) RETURN user",
                {_id: req.cookies._id}
            ).then(result => {
                if(bcrypt.compareSync(req.body.password, _.get(result.records[0].get('user'), 'properties').password)){
                    neo_session.run(
                        "MATCH (user:User {_id: $_id}) SET user.login=$newLogin, user.address=$newAddress, user.phone=$newPhone RETURN user",
                        {
                            _id: req.cookies._id,
                            newLogin: req.body.login,
                            newAddress: req.body.address,
                            newPhone: req.body.phone
                        }
                    ).then((user)=>{
                        const newUser = _.get(user.records[0].get('user'), 'properties')
                        console.log(newUser)
                        const newAccessToken = jwt.sign(newUser, newUser.api_key, { expiresIn: '1d'})
                        res.cookie('accessToken', newAccessToken)
                        //res.redirect('/profile')
                        res.sendStatus(200)
                    }).catch((error)=>{
                        console.log(error)
                    })
                }else{
                    let error="Wrong password"
                    res.status(400).json({error: error});
                }
            }).catch((err)=>{
                console.log(err)
            })
        }else{
            let error = "Passwords are not equal"
            res.status(400).json({error: error});
        }
    });
    app.put('/change_password', isLoggedIn, function(req, res) {
        if(req.body.new_password === req.body.new_password_2){
            const neo_session = neo_driver.session();
            neo_session.run(
                "MATCH (user:User {_id: $_id}) RETURN user",
                {_id: req.cookies._id}
            ).then(result => {
                if(bcrypt.compareSync(req.body.password, _.get(result.records[0].get('user'), 'properties').password)){
                    neo_session.run(
                        "MATCH (user:User {_id: $_id}) SET user.password=$new_password RETURN user",
                        {
                            _id: req.cookies._id,
                            new_password: bcrypt.hashSync(req.body.new_password, bcrypt.genSaltSync(8), null),
                        }
                    ).then((user)=>{
                        const newUser = _.get(user.records[0].get('user'), 'properties')
                        const newAccessToken = jwt.sign(newUser, newUser.api_key, { expiresIn: '1d'})
                        res.cookie('accessToken', newAccessToken)
                        res.sendStatus(200)
                    }).catch((error)=>{
                        console.log(error)
                    })
                }else{
                    let error="Wrong password"
                    res.status(400).json({error: error});
                }
            }).catch((err)=>{
                console.log(err)
            })
        }else{
            let error = "New passwords are not equal"
            res.status(400).json({error: error});
        }
    });

    
    app.post('/addGame',isLoggedIn, isAdmin, function(req, res){ 
        gameManage.addGame(req.body, neo_driver).then(()=>{
            res.redirect('/manageGames');
        })
    });
    app.put('/updateGame',isLoggedIn, isAdmin, function(req, res) { //restfull put
        const game_id = req.query.game_id.replace('.', '')
        gameManage.updateGame(game_id, req.body, neo_driver).then(()=>{
            res.status(200).json(req.body);
        })
    });
    app.post('/importGamesFromJsonFile',isLoggedIn, isAdmin, function(req, res){
        //console.log(req.body)
        req.body.forEach(game=>{
            let gameToAdd = {
                title: game.title,
                publisher: game.publisher,
                genre: game.genre,
                release_date: game.release_date,
                short_description: game.short_description,
                price: game.price
            }
            console.log(gameToAdd)
            gameManage.addGame(gameToAdd, neo_driver)
        })
        res.sendStatus(201)
    })

    app.get('/searchByTitle',isLoggedIn, async function(req, res){
        const filteredGames = await gameManage.filterGamesByTitle(req.query.title, neo_driver);
        res.render('games/searchedGames.ejs',{
            gamesList: filteredGames,
        })
    });
    app.get('/searchByPublisher',isLoggedIn, async function(req, res){
        const filteredGames = await gameManage.filterGamesByPublisher(req.query.publisher, neo_driver);
        res.render('games/searchedGames.ejs',{
            gamesList: filteredGames,
        })
    });
    app.get('/searchByGenre',isLoggedIn, async function(req, res){
        const filteredGames = await gameManage.filterGamesByGenre(req.query.genre, neo_driver);
        res.render('games/searchedGames.ejs',{
            gamesList: filteredGames,
        })
    });
    //user posts
    
    

}