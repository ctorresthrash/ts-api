'use strict';

const {jwtValidateFunction} = require('../../../validations/auth');
const config = require('../../../config/config.json');

exports.register = function (server, options, next) {

  server.dependency('hapi-auth-jwt2', (depServer, after) => {
    return after();
  });

  server
    .auth
    .strategy('jwt', 'jwt', {
      key: process.env.JWT_KEY, // Never Share your secret key
      validateFunc: jwtValidateFunction, // validate function defined above
      verifyOptions: {
        algorithms: ['HS256']
      } // pick a strong algorithm
    });

  server
    .auth
    .default('jwt');

  server.route([
    {
      path: '/',
      method: 'GET',
      config: {
        auth: false
      },
      handler: (request, reply) => {
        server.log("info", request.info);
        reply({message: "Hello World"});
      }
    }, {
      path: '/restricted',
      method: 'GET',
      config: {
        auth: 'jwt'
      },
      handler: (request, reply) => {
        reply({text: 'You used a Token!'}).header("Authorization", request.headers.authorization);
      }
    },
    ...require("./auth")
  ]);

  return next();
};

exports.register.attributes = {
  name: 'api-v1-routes'
};