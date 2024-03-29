const gameManage = require("../config/gameManage");
var Game = require('../app/models/game.js');
var User = require('../app/models/user.js');
var permissions = require('./permissions.js');
const userManage = require("../config/userManage");
const e = require("connect-flash");
const server = require("../server")

//cannot use req.params in git requests, nee dto use req.query!!!!!!!!

module.exports = function(app, passport) {
    app.get('/', function(req, res) {
        if(req.user===undefined || res.logout != undefined){
            res.render('index.ejs');
        }else{
            res.redirect('/main')
        }
    });
    app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });
    app.get('/logout', function(req, res) {
        req.session.destroy(function(){
            res.redirect('/')
        })
    });
    app.get('/main',isLoggedIn, function(req, res) {
        Game.find({}, function(err, games){
            //console.log(req.user)
            res.render('main.ejs',{
                gamesList: games,
                user: {
                    _id: req.user._id,
                    email: req.user.email,
                    library: req.user.library,
                    role: req.user.role 
                }
            })
        })
    });

    //chats
    app.get('/chats',isLoggedIn, function(req, res) {
            res.render('chats.ejs',{
                user: {
                    _id: req.user._id,
                    email: req.user.email,
                    library: req.user.library,
                    role: req.user.role 
                },
                
            });
        });
    app.get('/chat/:chatId',isLoggedIn, function(req, res) {
        res.render('chat.ejs',{
            user: {
                _id: req.user._id,
                email: req.user.email,
                library: req.user.library,
                role: req.user.role 
            },
            chat: req.params.chatId
        });
    });

    //games
    app.get('/manageGames',isLoggedIn, permissions.isAdmin, function(req, res) {
        res.render('games/manageGames.ejs'); //?????
    });
    app.get('/addGame', isLoggedIn, permissions.isAdmin, function(req, res) { 
        res.render('games/addGame.ejs'); //?????
    });
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
    app.delete('/removeGame/:game_id',isLoggedIn, permissions.isAdmin, function(req, res) { //restfull delete
        console.log("removegame?")
        const game_id = req.params.game_id.replace('.', '')
        Game.deleteOne({_id: game_id}).then(function(){
            console.log(`Game with id ${game_id} removed`); // Success
            //res.redirect('/listOfGames');
            res.status(204).json(null)
        }).catch(function(error){
            console.log(error); // Failure
        });
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
    //users
    app.put('/mute', isLoggedIn, permissions.isModerator, function(req, res) { //restfull put
        User.findOne({_id: req.query.userId}, function(err, user){
            if(user.role == 'BASIC'){
                server.chatRooms.forEach(x => {
                    if(x.users.includes(req.query.userId.valueOf())){
                        console.log("muted")
                        server.server.publish(x.key, `${req.query.userId}|BANNED`)
                    }
                })
                userManage.changeRole(req.query.userId, 'MUTED', res)
                //userManage.changeRole(req.params.userId, 'MUTED', res, '/manageUsers')
            }else{
                res.status(409)
                return res.send('User does not meet the requirements(have to be moderaBASICtor)')
            }
        })
    })
    app.put('/muteFromChat', isLoggedIn, permissions.isModerator, function(req, res) { 
        console.log(req.query.userId)
        console.log(req.query.chat)
        User.findOne({_id: req.query.userId}, function(err, user){
            if(user.role == 'BASIC'){
                server.chatRooms.forEach(x => {
                    if(x.users.includes(req.query.userId.valueOf())){
                        console.log("muted from chat")
                        server.server.publish(x.key, `${req.query.userId}|BANNED`)
                    }
                })
                userManage.changeRole(req.query.userId, 'MUTED', res)
            }else{
                res.status(409)
                return res.send('User does not meet the requirements(have to be BASIC)')
            }
        })
    })
    app.put('/makeBasic', isLoggedIn, permissions.isModerator, function(req, res) { //restfull put
        User.findOne({_id: req.query.userId}, function(err, user){
            if(user.role == 'MUTED' || user.role == 'MODERATOR' ){
                userManage.changeRole(req.query.userId, 'BASIC', res)
            }else{
                res.status(409)
                return res.send('User does not meet the requirements(have to be MUTED or MODERATOR)')
            }
        })
    })
    app.put('/makeModerator', isLoggedIn, permissions.isAdmin, function(req, res) { //restfull put
        User.findOne({_id: req.query.userId}, function(err, user){
            if(user.role == 'BASIC'){
                userManage.changeRole(req.query.userId, 'MODERATOR', res)
                
            }else{
                res.status(409)
                return res.send('User does not meet the requirements(have to be BASIC)')
            }
        })
    })
    app.put('/makeAdmin', isLoggedIn, permissions.isAdmin, function(req, res) { //restfull put
        User.findOne({_id: req.query.userId}, function(err, user){
            if(user.role == 'MODERATOR'){
                userManage.changeRole(req.query.userId, 'ADMIN', res)
            }else{
                res.status(409)
                return res.send('User does not meet the requirements(have to be MODERATOR)')
            }
        })
    })
    app.get('/manageUsers', isLoggedIn, permissions.isModerator, function(req, res) {
        User.find({}, function(err, users){
            res.render('users/manageUsers.ejs',{
                usersList: users,
                you: {
                    email: req.user.email,
                    library: req.user.library,
                    role: req.user.role 
                }
            })
        })
    });
    /*app.post('/mute/:userId', isLoggedIn, permissions.isModerator, function(req, res) { //tego w ogóle nie powinno być
        User.findOne({_id: req.params.userId}, function(err, user){
            if(user.role == 'BASIC'){
                server.chatRooms.forEach(x => {
                    if(x.users.includes(req.params.userId.valueOf())){
                        console.log("muted")
                        server.server.publish(x.key, `${req.params.userId}|BANNED`)
                    }
                })
                userManage.changeRole(req.params.userId, 'MUTED', res, `/chat/${req.query.chat}`)
            }else{
                res.status(409)
                return res.send('User does not meet the requirements(have to be BASIC)')
            }
        })
    })*/
    

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
    app.put('/updateGame',isLoggedIn, permissions.isAdmin, function(req, res) { //restfull put
        const game_id = req.query.game_id.replace('.', '')
        console.log(req.body) //???
        gameManage.updateGame(game_id, req.body)
        //res.redirect('/listOfGames');
        res.status(200).json(req.body);
    });
    //zrobić jako link...!!!!!
    /*app.post('/searchByName',isLoggedIn, function(req, res){
        Game.find({"name": { $regex: `${req.body.name}`}}, function(err, games){
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
    });*/
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