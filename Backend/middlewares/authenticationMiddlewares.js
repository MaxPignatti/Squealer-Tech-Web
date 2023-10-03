const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Define authentication middleware
const authenticateWithToken = (req, res, next) => {
    const token = req.cookies.access_token; // Get the access token from the cookie

  if (!token) {
    // No access token cookie, proceed as usual
    return next();
  }

  // Verify and decode the token
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      // Invalid or expired token, clear the cookie and proceed as usual
      res.clearCookie('access_token');
      return next();
    }

    // Token is valid, set the user in the request object
    req.user = { username: decoded.username };

    // Optionally, you can refresh the access token here if needed

    next();
  });
};

module.exports = authenticateWithToken;
