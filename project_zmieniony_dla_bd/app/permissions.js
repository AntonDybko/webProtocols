var User = require('./models/user.js');

module.exports = {
    isAdmin:function(req, res, next){
        if(!(res.locals.user.role === "ADMIN")){
            res.status(401)
            return res.send('Access is allowed only to administrators')
        }
        next()
    },
}