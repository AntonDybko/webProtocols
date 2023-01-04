const gameManage = require("../config/gameManage");
var Game = require('../app/models/game.js');
var User = require('../app/models/user.js');
var permissions = require('./permissions.js');
const userManage = require("../config/userManage");

module.exports = function(app, passport) {
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
        //res.render('main.ejs');
    });

    app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    app.get('/chat',isLoggedIn, function(req, res) {
        res.render('chat.ejs');
    });

    app.get('/main',isLoggedIn, function(req, res) {
        Game.find({}, function(err, games){
            //console.log(req.user)
            res.render('main.ejs',{
                gamesList: games,
                user: req.user
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
    /*app.get('/searchedGames', isLoggedIn, permissions.isAdmin, function(req, res) {
        console.log(req.body)
        res.render('games/searchedGames.ejs',{
            games: req.body.games,
            user: req.user
        }); //?????
    });*/
    app.get('/listOfGames', isLoggedIn, permissions.isAdmin, function(req, res) {
        Game.find({}, function(err, games){
            //console.log(games)
            res.render('games/listOfGames.ejs',{
                gamesList: games
            })
        })
    });
    app.get('/updateGame/:game_id',isLoggedIn, permissions.isAdmin, function(req, res) {
        const game_id = req.params.game_id.replace('.', '')
        Game.findOne({_id: game_id}, function(err, game){
            res.render('games/updateGame.ejs',{
                game: game
            }); 
        })
    });
    app.get('/deleteGame/:game_id',isLoggedIn, permissions.isAdmin, function(req, res) {
        const game_id = req.params.game_id.replace('.', '')
        Game.deleteOne({_id: game_id}).then(function(){
            console.log(`Game with id ${game_id} deleted`); // Success
            res.redirect('/listOfGames');
        }).catch(function(error){
            console.log(error); // Failure
        });
    });
    app.get('/gameInfo/:game_id',isLoggedIn, function(req, res) {
        const game_id = req.params.game_id.replace('.', '')
        Game.findOne({_id: game_id}, function(err, game){
            res.render('games/gameInfo.ejs',{
                game: game
            }); 
        })
    });
    //users
    

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    app.get('/library',isLoggedIn, function(req, res){
        //console.log(req.user.library)
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
                            //console.log(yourGames)
                            res.render('library.ejs',{
                                yourGames: yourGames,
                            })
                        }
                    }

                })
            })
        }
        
        //res.redirect('/main'); //test
    });
    app.get('/removeFromLibrary/:game_id', isLoggedIn, permissions.isAdmin, function(req, res) {
        const game_id = req.params.game_id.replace('.', '')
        console.log(game_id)
        userManage.removeFromLibrary(game_id, req.user._id)
        res.redirect('/library');

    });


    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();
        // if they aren't redirect them to the home page
        res.redirect('/');
    }
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/main', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/main', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    app.post('/addGame',isLoggedIn, permissions.isAdmin, function(req, res){
        gameManage.addGame(req.body)
        res.redirect('/manageGames');
    });
    app.post('/updateGame/:game_id',isLoggedIn, permissions.isAdmin, function(req, res) {
        const game_id = req.params.game_id.replace('.', '')
        console.log(req.body)
        gameManage.updateGame(game_id, req.body)
        res.redirect('/listOfGames');
    });
    app.post('/searchByName',isLoggedIn, function(req, res){
        //console.log(req.body.name)
        Game.find({"name": { $regex: `${req.body.name}`}}, function(err, games){
            //console.log(games)
            res.render('games/searchedGames.ejs',{
                games: games,
                user: req.user
            })
        })
        //gameManage.addGame(req.body)
        //res.redirect('/manageGames');
    });
    //user posts
    app.post('/addToLibrary/:game_id',isLoggedIn, function(req, res){
        const game_id = req.params.game_id.replace('.', '')
        userManage.addToLibrary(game_id, req.user)
        //res.redirect('/main'); //test
    });
    

}