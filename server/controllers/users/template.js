const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const axios = require('axios');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

module.exports = function (db) {
  const User = db['User'];
  const Friendship = db['Friendship'];

  return {

  }
}
