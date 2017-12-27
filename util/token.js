'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config/config.json');

function createToken(user) {
  const jsonWebToken = jwt.sign(
    { id: user.id, username: user.username },
    config.jwtKey,
    { algorithm: 'HS256', expiresIn: '1h' }
  );
  return jsonWebToken;
}

module.exports = createToken;
