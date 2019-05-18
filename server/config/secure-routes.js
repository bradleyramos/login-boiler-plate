const express = require('express');
const router = express.Router();
const cors = require('cors');
const http = require('http');
const url = require('url');


module.exports = function(db) {
  const users = require('../controllers/users.js')(db);

  router.use(cors());

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
  router.get('/getFriendRequests', (req, res, next) => {
    users.listFriendRequests(req, res);
  });
  router.get('/sendFriendRequest/:id', (req, res, next) => {
    users.requestFriendById(req, res);
  });
  router.get('/acceptFriendRequest/:id', (req, res, next) => {
    users.acceptFriendRequest(req, res);
  });
  router.get('/removeFriend/:id', (req, res, next) => {

  });
  router.get('/searchUsers', (req, res, next) => {
    let queryString = url.parse(req.url, true).query;
    console.log(queryString, queryString.phone_number);
    req.body.phone_number = queryString.phone_number;
    users.listUsersByPhoneNumber(req,res);
  });
  router.get('/searchFriends', (req, res, next) => {

  });
  router.get('/getFriends', (req, res, next) => {
    users.listFriends(req, res);
  });
  router.post('/uploadAvatar', (req, res, next) => {
    users.uploadAvatar(req, res);
  });
  return router;
}
