const users = require('../controllers/user.controller.js');
const rateLimit = require("express-rate-limit");

const createAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 1,
    message: "Too many accounts created from this IP, please try again after an hour"
})

module.exports = function(app){
    app.route("/register")
        .post(createAccountLimiter, users.create);

    app.route("/login")
        .post(users.login);
  

}


  