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

/* This defines a User with a first name, last name, email, phone number, and password */
const User = sequelize.define('users', {
  firstName: {
    type: Sequelize.STRING,
    /* Check that first name is between 2 and 45 letters */
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
    /* Check that last name is between 2 and 45 letters */
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
    /* Check that the email is valid using built-in validation */
    validate: {
      isEmail: {
        msg: "Must be valid email."
      },
      /* Make a call to the database to see if the email has already been used */
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
    /* Check that phone number is valid */
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
    /* Check that password is not an empty string (Did the indicator flag get triggered?) */
    validate: {
      validatePassword: function(value) {
        if(!/.+/.test(value)) {
          throw new Error('Password must be at least 8 characters long, contain a capital letter and a number.')
        }
      }
    }
  },
});

/* Messages are an anticipated feature, but I decided to set up the implementation for later */
const Message = sequelize.define('messages', {
  content: Sequelize.STRING
});
User.hasMany(Message, {as: 'Users'})
User.belongsToMany(User, {as: 'Friend',through:'friendships'})

sequelize.sync()

/* //This was to test feeding the database json to create a User
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

/* Simple get function from database. Does not actually get anything from database */
app.get('/', function(req,res) {
  res.json("My string");
}
)

/* Calls for the creation of a user, but only wors if all validation steps pass */
app.post('/api/users/create', function(req,res) {
  /* Because we are hashing the password ourselves, we have to validate the password before we hash it */
  var indicator = false;
  var validatePassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  if (!validatePassword.test(req.body.password)) {
    /* If validatePassword fails, then we flag the indicator to set hashPassword to fail*/
    indicator = true;
  }
  /* Initialize a new user so that we can set the password field to a hashed version */
  let newUser = new User();
  bcrypt.hash(req.body.password,10)
    .then(hashPassword => {
      if (indicator) {
        /* Set hashPassword to emptyString, failing validation */
        hashPassword = '';
      }
      console.log(hashPassword);
      /* Define each field to its corresponding received json data */
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
/* This is a test, converting an unhashed password to hash */
app.post('/api/users/passTest', function(req,res) {
  var password = req.body.password;
  bcrypt.hash(password,10)
    .then(hashPassword => {
      res.json(hashPassword);
    })
}
)
/* Another test, using a hardcoded hashed password from the above function,
 we check if inputted password is the same as the hashed password */
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
