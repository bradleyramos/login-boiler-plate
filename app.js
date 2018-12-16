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
    validate: {
      validateName: function(value) {
        if(!/[a-zA-Z]{2,45}/g.test(value)) {
          throw new Error('First name must be at least two letters.')
        }
      }
    }
  },
  lastName: {
    type: Sequelize.STRING,
    validate: {
      validateName: function(value) {
        if(!/[a-zA-Z]{2,45}/g.test(value)) {
          throw new Error('Last name must be at least two letters.')
        }
      }
    }
  },
  email: {
    type: Sequelize.STRING,
    validate: {
      isEmail: {
        msg: "Must be valid email."
      },
      validateUniqueEmail: function(value,next) {
        User.findOne({
          where: { email: value },
        }).done(user => {
          if (user) {
            return next ('Email already exists.');
          }
          next();
        })
      }
      }
    },
  phoneNumber: {
    type: Sequelize.STRING,
    validate: {
      validatePhoneNumber: function(value) {
        if(!/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(value)) {
          throw new Error('Must be valid phone number.')
        }
      }
    }
  },
  password: {
    type: Sequelize.STRING,
    validate: {
      validatePassword: function(value) {
        if(!/.+/.test(value)) {
          throw new Error('Password must be at least 8 characters long, contain a capital letter and a number.')
        }
      }
    }
  },
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
  var indicator = false;
  var validatePassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  if (!validatePassword.test(req.body.password)) {
    indicator = true;
  }
  let newUser = new User();
  bcrypt.hash(req.body.password,10)
    .then(hashPassword => {
      if (indicator) {
        hashPassword = '';
      }
      console.log(hashPassword);
      newUser.firstName = req.body.firstName;
      newUser.lastName = req.body.lastName;
      newUser.email = req.body.email;
      newUser.phoneNumber = req.body.phoneNumber;
      newUser.password = hashPassword;
      newUser.save().then(function(r) {
        let result = {};
        result['message'] = 'Account creation succeeded.';
        res.json(result);
      }).catch(err => {
          console.log(err);
          let result =  {};
          for(let error of err.errors) {
            result[error.path] = error.message;
          }
          result['message'] = 'Account creation failed.';
          return res.json(result);
        })
    })
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
