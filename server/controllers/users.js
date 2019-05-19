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

    const friendships = require('./users/friendships.js')(db);
    const registration = require('./users/registration.js')(db);
    const tests = require('./users/tests.js')(db);
    let user_info = {
        index: function (req, res) {
            res.json("Brad's Sample Page");
        },
        profile: function (req, res) {
            function getUser() {
                return new Promise(function (resolve, reject) {
                    User.findOne({
                        where: { email: req.user.email },
                    }).done(user => resolve(user));
                })
            }

            getUser().then(user => res.json(user))
        },
        listUsersByPhoneNumber: function (req,res) {
          User.findAll({
            contains: { phone_number: req.body.phone_number },

          }).then(users => {
            res.json(users);
          })
        }

    }


    return {...registration, ...user_info, ...friendships, ...tests};
}
