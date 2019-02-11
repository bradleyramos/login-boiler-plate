const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());
// passport.use(strategy);

let db = require('./server/config/sequelize.js')();

require('./server/config/routes.js')(app, db);

app.listen(8000, function () {
  console.log("listening on port 8000");
})

/* Simple get function from database. Does not actually get anything from database */

/* Local strategy. How to implement with API implementation? */
/* Using passport.js, check if entered username and password match with database */
// passport.use(new LocalStrategy({
//   usernameField: 'email',
//   passwordField: 'password'
// },
//   function (email, password, done) {
//     User.findOne({
//       where: { email: email }
//     }).then(user => {
//       if (!user) {
//         return done(null, false, { message: 'Incorrect email address.' });
//       }
//       bcrypt.compare(password, user.password)
//         .then(result => {
//           if (result) {
//             return done(null, user);
//           } else {
//             return done(null, false, { message: 'Incorrect password.' });
//           }
//         }).catch(err => {
//           return done(null, false, { message: 'Runtime issues.' });
//         })
//     })
//   }
// ));

//This verifies that the token sent by the user is valid --scotch.io
// passport.use(new JWTstrategy({
//   //secret we used to sign our JWT
//   secretOrKey: 'minion',
//   //we expect the user to send the token as a query paramater with the name 'secret_token'
//   jwtFromRequest: ExtractJWT.fromUrlQueryParameter('secret_token')
// }, async (token, done) => {
//   try {
//     //Pass the user details to the next middleware
//     return done(null, token.user);
//   } catch (error) {
//     done(error);
//   }
// }));

/* Issue tokens--based on separate tutorial */
// passport.use(
//   'jwt',
//   new JWTstrategy(opts, (jwt_payload, done) => {
//     try {
//       User.findOne({
//         where: {
//           username: jwt_payload.id,
//         },
//       }).then(user => {
//         if (user) {
//           console.log('user found in db in passport');
//           done(null, user);
//         } else {
//           console.log('user not found in db');
//           done(null,false);
//         }
//       });
//     } catch (err) {
//       done(err);
//     }
//   }),
// );

// /* Login with local strategy */
// app.post('/login', passport.authenticate('local', { failureRedirect: '/error' }),
//   function (req, res) {

//     res.json('Success!');

//     app.get('/profile', (req, res, next) => {

//     })

//     app.get('/authenticated', function (req, res) {
//       res.json(req.user);
//     })

//     app.get('/error', function (req, res) {
//       res.json('Error.');
//     }));