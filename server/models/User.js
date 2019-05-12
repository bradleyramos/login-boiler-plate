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
                    if (value == "" || !/[a-zA-Z]{2,45}/g.test(value)) {
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
                    if (value == "" || !/[a-zA-Z]{2,45}/g.test(value)) {
                        throw new Error('Last name must be at least two letters.')
                    }
                }
            }
        },
        phone_number: {
            type: Sequelize.STRING,
            /* Check that phone number is valid */
            validate: {
                validatePhoneNumber: function (value) {
                    if (value == "" || !/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(value)) {
                        throw new Error('Must be valid phone number.')
                    }
                },
                /* Make a call to the database to see if the phone number has already been used */
                validateUniquePhoneNumber: function (value, next) {
                  if (value == "") {
                      throw new Error('Email is empty.');
                  }
                    User.findOne({
                        where: { phone_number: value },
                    }).done(user => {
                        if (user) {
                            return next('Phone number already exists.');
                        }
                        next();
                    })
                }
        }
      },
        password: {
            type: Sequelize.STRING,
            /* Check that password is not an empty string (Did the indicator flag get triggered?) */
            validate: {
                validatePassword: function (value) {
                    if (value == "" || !/.+/.test(value)) {
                        throw new Error('Password must be at least 8 characters long, contain a capital letter and a number.')
                    }
                }
            }
        },
        image_url: {
            type: Sequelize.STRING
        }
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
