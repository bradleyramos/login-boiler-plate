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
        index: function (req, res) {
            res.json("Brad's Sample Page");
        },
        register: function (req, res) {
            /* Initialize a new user so that we can set the password field to a hashed version */
            let newUser = new User();

            newUser.first_name = req.body.first_name;
            newUser.last_name = req.body.last_name;
            newUser.phone_number = req.body.phone_number;
            newUser.password = req.body.password;
            newUser.save().then(function (r) {
                let result = {};
                result['message'] = 'Account creation succeeded.';
                res.json(result);
            }).catch(err => {
                console.log('qwerrr', err);
                let result = {};
                for (let error of err.errors) {
                    result[error.path] = error.message;
                }
                result['message'] = 'Account creation failed.';
                return res.json(result);
            })
        },
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
        },
        changePassword: function (req, res) {
            User.findOne({
                where: { phone_number: req.body.changePhoneNumber },
            }).done(user => {
                if (user) {
                    let updatedPassword = req.body.changePassword;
                    bcrypt.hash(updatedPassword, 10)
                        .then(hashUpdatedPassword => {
                            user.update({
                                password: hashUpdatedPassword
                            }).then(() => { })
                        })
                }
                res.json('Password updated.');
            })
        },
        profile: function (req, res) {
            function getUser() {
                return new Promise(function (resolve, reject) {
                    User.findOne({
                        where: { phone_number: req.user.phone_number },
                    }).done(user => resolve(user));
                })
            }

            getUser().then(user => res.json(user))
        },
        searchFriendsByPhoneNumber: function (req, res) {
            function getUser() {
                return new Promise(function (resolve, reject) {
                    User.findOne({
                        where: { phone_number: req.body.phone_number },
                    }).done(user => resolve(user));
                })
            }

            getUser().then(user => res.json(user))
        },
        addFriendById: async function (req, res) {
            let id = req.params.id;
            function retrieveId(phoneNumber) {
              return new Promise(function (resolve, reject) {
                User.findOne({
                  where: { phone_number: phoneNumber },
                }).done(user => {
                  resolve(user.id);
                })
              })
            }

            function addUser(userId, friendId) {
                return new Promise(function (resolve, reject) {
                    let entry = new Friendship();
                    entry.user_id = userId;
                    entry.friend_id = friendId;
                    entry.is_accepted = false;
                    entry.save().then(function (r) {
                        let result = {};
                        result['message'] = 'Friendship succeeded.';
                        resolve(result);
                    }).catch(err => {
                        let result = {};
                        if (err.errors) {
                          for (let error of err.errors) {
                              result[error.path] = error.message;
                          }
                        }
                        result['message'] = 'Friendship failed.';
                        resolve(result);
                    })
                })
            }

            let ownerId = await retrieveId(req.user.phone_number);

            if (ownerId == id) {
              res.json({'message': 'Cannot add yourself!'});
            }

            let result = await addUser(ownerId, id);
            res.json(result);
        },
        listFriendsByPhoneNumber: function (req, res) {
          let friends = [];
            User.findAll({
                where: { phone_number: req.user.phone_number },
                include: [{
                    model: User,
                    as: 'Friend',
                    required: true
                }]
            }).then(user => {
                friends.push(user.Friend);
            });
          res.json(friends);
        },
        uploadAvatar: function (req, res) {
            let base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");
            let static_path = path.join(__dirname, './../static_files');

            fs.writeFile(`${static_path}/${req.body.name}.png`, base64Data, 'base64', function (err) {
                console.log(err);
            });

            let url = `${req.protocol}://${req.get('host')}/static/${req.body.name}.png`;

            User.findOne({
                where: { phone_number: req.user.phone_number },
            }).done(user => {
                user.image_url = url;
                user.save({skip: ['password', 'email']}).then(res.json("test"));
            })
        }

    }
}
