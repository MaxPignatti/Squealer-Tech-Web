const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticateWithToken = (req, res, next) => {
    const token = req.cookies.access_token;

  if (!token) {
    return next();
  }

  // Verify and decode the token
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      res.clearCookie('access_token');
      return next();
    }

    // Token is valid, set the user in the request object
    req.user = { username: decoded.username };

    next();
  });
};

module.exports = authenticateWithToken;
