const passport = require('passport');

module.exports = function (app, db) {
    const users = require('../controllers/users.js')(db);

    app.use(passport.initialize());
    app.use(passport.session());

    app.get('/', function (req, res) {
        users.index(req, res);
    })

    /* Calls for the creation of a user, but only works if all validation steps pass */
    app.post('/api/users/create', function (req, res) {
        users.register(req, res);
    })


    /* This is a test, converting an unhashed password to hash */
    app.post('/api/users/passTest', function (req, res) {
        users.passTest(req, res);
    })

    /* Another test, using a hardcoded hashed password from the above function,
     we check if inputted password is the same as the hashed password */
    app.post('/api/users/passTestReturn', function (req, res) {
        users.passTestReturn(req, res);
    })

    /* PUT request to change the password of a given email. Find email, change corresponding password */
    app.put('/api/users/changePassword', function (req, res) {
        users.changePassword(req, res);
    })

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