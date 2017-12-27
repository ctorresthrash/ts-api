'use strict';

const Boom = require('boom');
const models = require('../models/index');
const User = models.User;
const Op = models.Sequelize.Op;
const bcrypt = require('bcrypt');

function verifyUniqueUser(req, res) {
  // Find an entry from the database that
  // matches either the email or username
  const {email, username} = req.payload
  User.findOne({
    where: {
      [Op.or]: [{ email }, { username }]
    }
  }).then(user=>{
    let message = '';
    if (user) {
      if (user.username === username) {
        message=`${message}Username taken\n`;
      }
      if (user.email === email) {
        message=`${message}Email taken\n`;
      }
      res(Boom.badRequest(message));
      return ;
    }
    res(req.payload);
  }).catch(err=>{
    res(Boom.internal(err));
  });
}

function verifyCredentials(req, res) {
  const { username, password} = req.payload;
  User.findOne({
    where: {
      [Op.or]: [{ username }]
    }
  }).then(user=>{
    if (user) {
      bcrypt.compare(password, user.password, (err, isValid) => {
        if (isValid) {
          return res(user);
        }
        return res(Boom.unauthorized('Incorrect username or email!'));
      });
    }else{
      return res(Boom.unauthorized('Incorrect username or email!'));
    }
  }).catch(err=>{
    return res(Boom.internal(err));
  });
}

module.exports = {
  verifyUniqueUser: verifyUniqueUser,
  verifyCredentials: verifyCredentials
};
