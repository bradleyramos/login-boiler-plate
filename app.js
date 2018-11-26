const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const request = require('request');
const Sequelize = require('sequelize');

app.use(cors());
app.use(bodyParser.json());

const sequelize = new Sequelize('bradatabase', 'root', 'root', {
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
  'first name': Sequelize.STRING,
  'last name': Sequelize.STRING,
  email: Sequelize.STRING,
  'phone number': Sequelize.STRING,
  password: Sequelize.STRING
}, {
  timestamps: false
});
const Message = sequelize.define('messages', {
  content: Sequelize.STRING,
  created_at: Sequelize.DATE,
  updated_at: Sequelize.DATE
},{
  timestamps: false
});
User.hasMany(Message, {as: 'Users'})

sequelize.sync()
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

app.get('/', function(req,res) {
  res.json("My string");
}
)

app.listen(8000, function() {
  console.log("listening on port 8000");
}
)
