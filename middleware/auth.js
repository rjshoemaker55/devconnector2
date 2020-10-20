const jwt = require('jsonwebtoken');
const config = require('config');

// Auth middleware: takes the reqest and response. Checks if the request contains a jwt. If not, returns errror.
// If yes, checks to make sure it is valid, then decodes the jwt, and returns the user id
module.exports = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied.' });
  }

  // Verfiy token
  try {
    // Uses jwt.verify to decode the token.
    // Arg 1. Token: we use 'token' pulled from headers as 'x-auth-token'
    // Arg 2. Secret: we pull from config
    const decoded = jwt.verify(token, config.get('jwtSecret'));

    // Sets user in the request to decoded token's 'user' value in the payload
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid. ' });
  }
};
