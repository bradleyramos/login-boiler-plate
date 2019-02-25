const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;


module.exports = function (app, db) {
  const User = db['User'];

  app.use(passport.initialize());
  app.use(passport.session());

  //This verifies that the token sent by the user is valid
  passport.use(new JWTstrategy({
    //secret we used to sign our JWT
    secretOrKey: 'top_secret',
    //we expect the user to send the token as a query paramater with the name 'secret_token'
    jwtFromRequest: ExtractJWT.fromUrlQueryParameter('secret_token')
  }, async (token, done) => {
    try {
      //Pass the user details to the next middleware
      return done(null, token.user);
    } catch (error) {
      done(error);
    }
  }));

  /* Signup */
  passport.use('signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, function (req, username, password, done) {
    let newUser = new User();

    newUser.first_name = req.body.first_name;
    newUser.last_name = req.body.last_name;
    newUser.email = req.body.email;
    newUser.phone_number = req.body.phone_number;
    newUser.password = req.body.password;
    newUser.save().then(function (user) {
      return done(null, user);
    }).catch(err => {
      done(err);
    })

  }));


  /* Using passport.js, check if entered username and password match with database */
  passport.use('login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
    function (email, password, done) {
      User.findOne({
        where: { email: email }
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'Incorrect email address.' });
        }
        bcrypt.compare(password, user.password)
          .then(result => {
            if (result) {
              return done(null, user);
            } else {
              return done(null, false, { message: 'Incorrect password.' });
            }
          }).catch(err => {
            return done(null, false, { message: 'Runtime issues.' });
          })
      })
    }
  ));

  /* */

}
