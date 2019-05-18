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
            newUser.email = req.body.email;
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
                where: { email: req.body.changeEmail },
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
                        where: { email: req.user.email },
                    }).done(user => resolve(user));
                })
            }

            getUser().then(user => res.json(user))
        },
        searchFriendsByEmail: function (req, res) {
            function getUser() {
                return new Promise(function (resolve, reject) {
                    User.findOne({
                        where: { email: req.body.email },
                    }).done(user => resolve(user));
                })
            }

            getUser().then(user => res.json(user))
        },
        requestFriendById: async function (req, res) {
            let id = req.params.id;
            function retrieveId(email) {
              return new Promise(function (resolve, reject) {
                User.findOne({
                  where: { email: email },
                }).done(user => {
                  resolve(user.id);
                })
              })
            }

            function sendFriendRequest(userId, friendId) {
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

            let ownerId = await retrieveId(req.user.email);

            if (ownerId == id) {
              res.json({'message': 'Cannot add yourself!'});
            }

            let result = await sendFriendRequest(ownerId, id);
            res.json(result);
        },
        acceptFriendById: async function (req, res) {
            let id = req.params.id;
            function retrieveId(email) {
              return new Promise(function (resolve, reject) {
                User.findOne({
                  where: { email: email },
                }).done(user => {
                  resolve(user.id);
                })
              })
            }

            function acceptFriendRequest(userId, friendId) {
                return new Promise(function (resolve, reject) {
                    Friendship.findOne({
                        where: { user_id: userId, friend_id: friendId }
                    }).done(friendship => {
                        let result = {};
                        if (friendship) {
                            friendship.update({
                                is_accepted: true
                            }).then(() => {
                                result['message'] = 'Friendship succeeded.';
                                resolve(result);
                            })
                        }
                        else {
                            result['message'] = 'Friendship failed.';
                            resolve(result);
                        }
                    })
                })
            }

            let ownerId = await retrieveId(req.user.email);

            if (ownerId == id) {
              res.json({'message': 'Cannot accept yourself!'});
            }

            let result = await acceptFriendRequest(ownerId, id);
            res.json(result);
        },
        deleteFriendById: async function (req, res) {
            let id = req.params.id;
            function retrieveId(email) {
              return new Promise(function (resolve, reject) {
                User.findOne({
                  where: { email: email },
                }).done(user => {
                  resolve(user.id);
                })
              })
            }

            function deleteFriend(userId, friendId) {
                return new Promise(function (resolve, reject) {
                    Friendship.findOne({
                        where: { user_id: userId, friend_id: friendId }
                    }).done(friendship => {
                        let result = {};
                        if (friendship) {
                            friendship.destroy({
                                force: true
                            }).then(() => {
                                result['message'] = 'Friendship deleted.';
                                resolve(result);
                            })
                        }
                        else {
                            result['message'] = 'Friendship wasn\'t deleted.';
                            resolve(result);
                        }
                    })
                })
            }

            let ownerId = await retrieveId(req.user.email);

            if (ownerId == id) {
              res.json({'message': 'Cannot delete yourself!'});
            }

            let result = await deleteFriend(ownerId, id);
            res.json(result);
        },
        listFriends: function (req, res) {
            User.findOne({
                where: { email: req.user.email },
                include: [{
                    model: User,
                    as: 'Friend',
                    required: true
                }]
            }).then(user => {
                let users = user.Friend;
                res.json(users.filter(f => f.friendships.is_accepted));
            });
        },
        listFriendRequests: function (req, res) {
            User.findOne({
                where: { email: req.user.email },
                include: [{
                    model: User,
                    as: 'Friend',
                    required: true
                }]
            }).then(user => {
                let users = user.Friend;
                res.json(users.filter(f => !f.friendships.is_accepted));
            });
        },
        listUsersByPhoneNumber: function (req,res) {
          User.findAll({
            contains: { phone_number: req.body.phone_number },

          }).then(users => {
            res.json(users);
          })
        },
        uploadAvatar: function (req, res) {
            let base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");
            let static_path = path.join(__dirname, './../static_files');

            fs.writeFile(`${static_path}/${req.body.name}.png`, base64Data, 'base64', function (err) {
                console.log(err);
            });

            let url = `${req.protocol}://${req.get('host')}/static/${req.body.name}.png`;

            User.findOne({
                where: { email: req.user.email },
            }).done(user => {
                user.image_url = url;
                user.save({skip: ['password', 'email']}).then(res.json("test"));
            })
        }

    }
}
