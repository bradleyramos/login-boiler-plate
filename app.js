const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const request = require('request');
const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');

app.use(cors());
app.use(bodyParser.json());

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

const User = sequelize.define('users', {
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING,
  phoneNumber: Sequelize.STRING,
  password: Sequelize.STRING
});
const Message = sequelize.define('messages', {
  content: Sequelize.STRING
});
User.hasMany(Message, {as: 'Users'})
User.belongsToMany(User, {as: 'Friend',through:'friendships'})

sequelize.sync()
/*
  .then(() => User.create({
    'first name': 'jane',
    'last name': 'doe',
    email: 'jdoe@gmail.com',
    'phone number': '1231231234',
    password: '1231231234',
  }))
  .then(jane => {
    console.log(jane.toJSON());
  });
  */

app.get('/', function(req,res) {
  res.json("My string");
}
)

app.post('/api/users/create', function(req,res) {
  User.create(req.body); //Don't call until everything is verified
  res.json(req.body);
}
)
app.post('/api/users/passTest', function(req,res) {
  var password = req.body.password;
  bcrypt.hash(password,10)
    .then(hashPassword => {
      res.json(hashPassword);
    })
}
)
app.post('/api/users/passTestReturn', function(req,res) {
  let storedPassword = '$2a$10$f1RCTpVHPZZ4dfDAyT2NzOP9XEOcIxcJT1T1PSlt/dxeeGIilRgt2';
  var realPassword = req.body.password;
  bcrypt.compare(realPassword,storedPassword)
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        res.json('nope');
      }
    })
    .catch(error => {
      res.json('you messed up');
    })
}
)

app.listen(8000, function() {
  console.log("listening on port 8000");
}
)
