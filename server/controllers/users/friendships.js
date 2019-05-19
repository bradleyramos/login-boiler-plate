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

        function createFriendship(userId, friendId) {
            return new Promise(function (resolve, reject) {
                let entry = new Friendship();
                entry.user_id = userId;
                entry.friend_id = friendId;
                entry.is_accepted = true;
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
          res.json({'message': 'Cannot accept yourself!'});
        }

        let result = await acceptFriendRequest(id, ownerId);

        if (result['message'] == 'Friendship succeeded.') {
            result = await createFriendship(ownerId, id);
        }

        res.json(result);
    },
    deleteFriendById: async function (req, res) {
        let id = req.params.id;
        let is_accepted = false;
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
                    is_accepted = friendship.is_accepted;
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

        function deleteFriendship(userId, friendId) {
            return new Promise(function (resolve, reject) {
                Friendship.findOne({
                    where: { user_id: friendId, friend_id: userId }
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

        if (result['message'] == 'Friendship deleted' && is_accepted) {
            result = await deleteFriendship(ownerId, id);
        }

        res.json(result);
    },
    listFriends: function (req, res) {
        User.findOne({
            where: { email: req.user.email },
            include: [{
                model: User,
                as: 'Friend',
                required: false
            }]
        }).then(user => {
            if (!user.Friend) {
              return res.json([]);
            }
            let users = user.Friend;
            res.json(users.filter(f => f.friendships.is_accepted));
        });
    },
    listFriendRequestsSent: function (req, res) {
        User.findOne({
            where: { email: req.user.email },
            include: [{
                model: User,
                as: 'Friend',
                required: false
            }]
        }).then(user => {
            if (!user.Friend) {
              return res.json([]);
            }
            let users = user.Friend;
            let friendships = users.filter(f => !f.friendships.is_accepted);
            friendships = friendships.map(f => f.friendships);
            res.json(friendships);
        });
    },
    listFriendRequestsReceived: async function (req, res) {
        function retrieveId(email) {
          return new Promise(function(resolve, reject) {
            User.findOne({
                where: { email: email }
            }).then(user => {
                if (!user) {
                  resolve(-1);
                }
                else {
                  resolve(user.id);
                }
            });
          })
        }

        let id = await retrieveId(req.user.email);

        Friendship.findAll({
            where: { friend_id: id }
        }).then(friends => {
            if (!friends) {
              return res.json([]);
            }
            res.json(friends);
        });
    }
  }
}
