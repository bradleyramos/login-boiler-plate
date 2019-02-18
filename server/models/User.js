const Sequelize = require('sequelize');
const Message = require('./Message.js');
const bcrypt = require('bcryptjs');

module.exports = function (sequelize) {
    /* This defines a User with a first name, last name, email, phone number, and password */
    const User = sequelize.define('users', {
        first_name: {
            type: Sequelize.STRING,
            /* Check that first name is between 2 and 45 letters */
            validate: {
                validateName: function (value) {
                    if (!/[a-zA-Z]{2,45}/g.test(value)) {
                        throw new Error('First name must be at least two letters.')
                    }
                }
            }
        },
        last_name: {
            type: Sequelize.STRING,
            /* Check that last name is between 2 and 45 letters */
            validate: {
                validateName: function (value) {
                    if (!/[a-zA-Z]{2,45}/g.test(value)) {
                        throw new Error('Last name must be at least two letters.')
                    }
                }
            }
        },
        email: {
            type: Sequelize.STRING,
            /* Check that the email is valid using built-in validation */
            validate: {
                isEmail: {
                    msg: "Must be valid email."
                },
                /* Make a call to the database to see if the email has already been used */
                validateUniqueEmail: function (value, next) {
                    User.findOne({
                        where: { email: value },
                    }).done(user => {
                        if (user) {
                            return next('Email already exists.');
                        }
                        next();
                    })
                }
            }
        },
        phone_number: {
            type: Sequelize.STRING,
            /* Check that phone number is valid */
            validate: {
                validatePhoneNumber: function (value) {
                    if (!/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(value)) {
                        throw new Error('Must be valid phone number.')
                    }
                }
            }
        },
        password: {
            type: Sequelize.STRING,
            /* Check that password is not an empty string (Did the indicator flag get triggered?) */
            validate: {
                validatePassword: function (value) {
                    if (!/.+/.test(value)) {
                        throw new Error('Password must be at least 8 characters long, contain a capital letter and a number.')
                    }
                }
            }
        },
    },
        {
            hooks: {
                afterValidate: (user, options) => {
                    let origPassword = user.password;

                    return new Promise((resolve, reject) => {
                        bcrypt.hash(origPassword, 10)
                            .then(hashPassword => {
                                console.log(hashPassword);
                                user.password = hashPassword;
                                return resolve(user, options);
                            })
                            .catch(err => {
                                return reject(new Error("Invalid password!"));
                            })
                    })
                }
            }
        });

    // When outputting user as json, do not output a password field
    User.prototype.toJSON = function () {
        var values = Object.assign({}, this.get());

        delete values.password;
        return values;
    }

    return User;
}