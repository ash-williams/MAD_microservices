const Joi = require("joi");
const jwt = require("jsonwebtoken");

//data
const users = [{
    "first_name": "Ash",
    "last_name": "Williams",
    "email": "ash@gmail.com",
    "password": "123456"
}];

create = (req, res) => {
    const schema = Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required().min(6)
    });
    
    const { error } = schema.validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const emailExist = users.find(o => o.email === req.body.email);
    if(emailExist) return res.status(400).send("Email already exists");
      
    const user = {
        user_id: users.length + 1,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password
    };
    
    users.push(user);

    return res.status(201).send({"id": user.user_id});
}

login = (req, res) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required().min(6)
    });
    
    const { error } = schema.validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const user = users.find(o => o.email === req.body.email);
    if(!user) return res.status(400).send("Email or password is wrong");

    const validPass = user.password === req.body.password;
    if(!validPass) return res.status(400).send("Email or password is wrong");
    
    const token = jwt.sign(
        {id: user.user_id}, 
        process.env.TOKEN_SECRET,
        { expiresIn: '1h' } // 1h
    );

    res.header("auth-token", token).send(token);

    // res.send("Logged In");

}

module.exports = {
    create: create,
    login: login 
}