const {loginSchema, signupSchema} = require('../../../validations/models');
const models = require('../../../models/index');
const Boom = require('boom');
const bcrypt = require('bcrypt');
const {verifyCredentials, verifyUniqueUser} = require('../../../util/user');
const createToken = require('../../../util/token');

async function hashPassword(password) {
  const hash = await bcrypt.hash(password, 10);
  return hash;
}

module.exports = [
  {
    path: '/login',
    method: 'POST',
    config: {
      auth: false,
      pre: [
        { method: verifyCredentials, assign: "user" }
      ],
      validate: {
        params: false,
        query: false,
        payload: loginSchema
      },
      handler: function login(request, reply) {
        const user = request.pre.user;
        reply(Object.assign({}, user.toJSON(), {token: createToken(user.toJSON())}));
      },
      tags: ['api']
    }
  }, {
    path: '/signup',
    method: 'POST',
    config: {
      auth: false,
      pre: [
        { method: verifyUniqueUser }
      ],
      validate: {
        params: false,
        query: false,
        payload: signupSchema
      },
      handler : async function signup(request, reply) {
        const hashedPassword = await hashPassword(request.payload.password);
        const user = await models.User.create(Object.assign({}, request.payload, {password: hashedPassword}), {
          attributes:{
            exclude: ['password']
          }
        });
        reply(Object.assign({}, {token: createToken(user.toJSON())}, user.toJSON())).code(201);
      },
      tags: ['api']
    }
  }
];