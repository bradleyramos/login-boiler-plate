const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcryptjs');

module.exports = function (db) {
    const User = db['User'];

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
        profile: function(req, res) {
            function getUser() {
                return new Promise(function (resolve, reject) {
                  console.log(req._id);
                    User.findOne({
                        where: { email: req.user.email },
                    }).done(user => resolve(user));
                })
            }

            getUser().then(user => res.json(user))
        }
    }
}