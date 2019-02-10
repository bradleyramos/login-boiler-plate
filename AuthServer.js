const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const request = require('request');
const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');
const session = require('express-session');
var passport = require('passport')
  , OAuthStrategy = require('passport-oauth').OAuthStrategy;
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;


var Auth0Strategy = require('passport-auth0'),
  passport = require('passport');
var strategy = new Auth0Strategy({
  domain: 'tagalongapp.auth0.com',
  clientID: 'McU8wBIRDR3yVaDuCyJmaEto1I2sY',
  clientSecret: 'minion',
  callbackURL: '/callback'
  },
  function(accessToken, refreshToken, extraParams, profile, done) {
    return done(null, profile);
  }
);

app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(session({ secret: "minion" }));
passport.use(strategy);

const sequelize = new Sequelize('mydb', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql',

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },

  // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
  operatorsAliases: false
});

/* Login callback for failed login */
app.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/login' }),
  function(req, res) {
    if (!req.user) {
      throw new Error('user null');
    }
    res.redirect("/");
  }
);

app.get('/login',
  passport.authenticate('auth0', {}), function(req, res) {
    res.redirect("/");
  })

app.get('/authenticated', function(req,res) {
  res.json(req.user);
})

app.get('/error', function(req,res) {
  res.json('Error.')
})

app.listen(8000, function() {
  console.log("listening on port 8000");
}
)
