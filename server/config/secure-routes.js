const express = require('express');
const router = express.Router();

module.exports = function(db) {
  const users = require('../controllers/users.js')(db);
  
  //Displays information tailored according to the logged in user
  router.get('/info', (req, res, next) => {
    //We'll just send back the user details and the token
    res.json({
      message : 'You made it to the secure route',
      user : req.user,
      token : req.query.secret_token
    })
  });
  router.get('/profile', (req, res, next) => {
    //We'll just send back the user details and the token
    users.profile(req, res);
  });
  router.get('/addUser/:id', (req, res, next) => {
    users.addFriendById(req, res);
  });
  router.get('/getFriends', (req, res, next) => {
    users.listFriendsByEmail(req, res);
  })
  return router;
}
