const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

module.exports = function(app, db) {
  const User = db['User'];

  app.use(passport.initialize());
  app.use(passport.session());


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

}
