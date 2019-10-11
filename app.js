const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const passport = require('passport');
const path = require('path');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// passport.use(strategy);

let db = require('./server/config/sequelize.js')();

const routes = require('./server/config/routes.js')(app, db);
const secureRoute = require('./server/config/secure-routes.js')(db);

app.use('/static', express.static(path.join(__dirname, 'server/static_files')));
app.use('/', routes);
app.use('/secure', passport.authenticate('jwt', { session : false }), secureRoute );


const server = app.listen(8000, function () {
  console.log("listening on port 8000");
});