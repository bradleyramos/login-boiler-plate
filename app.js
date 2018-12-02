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
  firstName: {
    type: Sequelize.STRING,
    /*
    validate: {
      validateName: function(value) {
        if (!/[a-zA-Z]{2,45}/g.test(value)) {
          throw new Error('First Name must be at least two characters long and only contain letters.')
        }
      }
    }
  },
  */
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
  var indicator = 0;
  var validateName = /[a-zA-Z]{2,45}/g;
  if (!validateName.test(req.body.firstName)) {
    res.json('First Name must be at least two characters long and only contain letters.');
  }
  validateName = /[a-zA-Z]{2,45}/g;
  if (!validateName.test(req.body.lastName)) {
    res.json('Last name must be at least two characters long and only contain letters.');
    indicator = 1;
  }
  var validateEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!validateEmail.test(req.body.email)) {
    res.json('Must contain valid email address.');
    indicator = 1;
  }
  var validateEmailExists= "";
  var validatePhone = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  if (!validatePhone.test(req.body.phoneNumber)) {
    res.json('Must contain valid phone number.');
    indicator = 1;
  }
  var validatePassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  if (!validatePassword.test(req.body.password)) {
    res.json('Password must be at least 8 characters long contain a number.');
    indicator = 1;
  }
  if (!indicator) {
    let newUser = new User();
    bcrypt.hash(req.body.password,10)
      .then(hashPassword => {
        newUser.firstName = req.body.firstName;
        newUser.lastName = req.body.lastName;
        newUser.email = req.body.email;
        newUser.phoneNumber = req.body.phoneNumber;
        newUser.password = hashPassword;
        newUser.save().then(function() {res.json(req.body)})
    })
  }
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
