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
