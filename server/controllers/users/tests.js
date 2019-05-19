const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const axios = require('axios');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

module.exports = function (db) {
  const User = db['User'];
  const Friendship = db['Friendship'];

  return {
    passTest: function (req, res) {
      let password = req.body.password;
      bcrypt.hash(password, 10)
      .then(hashPassword => {
        res.json(hashPassword);
      })
    },
    passTestReturn: function (req, res) {
      let storedPassword = '$2a$10$f1RCTpVHPZZ4dfDAyT2NzOP9XEOcIxcJT1T1PSlt/dxeeGIilRgt2';
      var realPassword = req.body.password;
      bcrypt.compare(realPassword, storedPassword)
      .then(result => {
        if (result) {
          res.json(result);
        } else {
          res.json('nope');
        }
      })
      .catch(error => {
        res.json('you messed up');
      })
    }
  }
}
