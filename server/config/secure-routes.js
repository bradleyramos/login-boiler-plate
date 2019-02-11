const express = require('express');
const router = express.Router();

module.exports = function() {
  //Displays information tailored according to the logged in user
  router.get('/info', (req, res, next) => {
    //We'll just send back the user details and the token
    res.json({
      message : 'You made it to the secure route',
      user : req.user,
      token : req.query.secret_token
    })
  });
  return router;
}
