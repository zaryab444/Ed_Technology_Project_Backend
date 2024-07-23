const jwt = require("jsonwebtoken");

const generateToken = (res, userId) =>{
    const token = jwt.sign({userId},process.env.
        JWT_SECRET,{
          expiresIn: '1d'
        });       
}

module.exports = generateToken;
