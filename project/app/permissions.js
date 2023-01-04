var User = require('./models/user.js');

module.exports = {
    isAdmin:function(req, res, next){
        if(!(req.user.role === User.ROLES.ADMIN )){
            res.status(401)
            return res.send('Access is allowed only to administrators')
        }
        next()
    },
    isModerator:function(req, rest, next){
        if(req.user.role === User.ROLES.ADMIN || req.user.role === User.ROLES.MODERATOR){
            next()
        }else{
            res.status(401)
            return res.send('Access is allowed only to moderators and administrators')
        }
    }
}