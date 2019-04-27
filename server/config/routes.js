const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

module.exports = function (app, db) {
  const users = require('../controllers/users.js')(db);

  require('./auth.js')(app, db);

  router.get('/', function (req, res) {
    users.index(req, res);
  })

  /* Calls for the creation of a user, but only works if all validation steps pass */
  router.post('/api/users/create', function (req, res) {
    users.register(req, res);
  })

  router.post('/api/upload', function (req, res) {
    users.uploadAvatar(req, res);
  })

  /* This is a test, converting an unhashed password to hash */
  router.post('/api/users/passTest', function (req, res) {
    users.passTest(req, res);
  })

  /* Another test, using a hardcoded hashed password from the above function,
  we check if inputted password is the same as the hashed password */
  router.post('/api/users/passTestReturn', function (req, res) {
    users.passTestReturn(req, res);
  })

  /* PUT request to change the password of a given email. Find email, change corresponding password */
  router.put('/api/users/changePassword', function (req, res) {
    users.changePassword(req, res);
  })

  //When the user sends a post request to this route, passport authenticates the user based on the
  //middleware created previously
  router.post('/signup', passport.authenticate('signup', { session: false }), async (req, res, next) => {
    res.json({
      message: 'Signup successful',
      user: req.user
    });
  });

  /* */
  router.post('/login', async (req, res, next) => {
    passport.authenticate('login', async (err, user, info) => {
      try {
        if (err || !user) {
          const error = {"name": "LoginValidationError", "errors": [
            {
              "message": "Invalid email or password",
              "type": "Validation error"
            }
          ]}
          return next(error);
        }
        req.login(user, { session: false }, async (error) => {
          if (error) return next(error)
          //We don't want to store the sensitive information such as the
          //user password in the token so we pick only the email and id

          const body = { _id: user._id, email: user.email };
          //Sign the JWT token and populate the payload with the user email and id
          const token = jwt.sign({ user: body }, 'top_secret');
          //Send back the token to the user
          return res.json({ token });
        });
      } catch (error) {
        return next('error');
      }
    })(req, res, next);
  });

  router.use('/signup',function (error, req, res, next) {
    res.json(error);
  });

  // generalized error function to guard against middleware failure
  router.use(function (error, req, res, next) {
    res.json(error);
  });

  return router;
  // /* Login callback for failed login */
  // app.get('/callback',
  //     passport.authenticate('auth0', { failureRedirect: '/login' }),
  //     function (req, res) {
  //         if (!req.user) {
  //             throw new Error('user null');
  //         }
  //         res.redirect("/");
  //     });

  // /* 0Auth Implementation. */
  // app.get('/login',
  //     passport.authenticate('auth0', {}), function (req, res) {
  //         res.redirect("/");
  //     });
}
