var Joi = require('joi');

module.exports = {
  loginSchema: Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required()
  }),
  signupSchema: Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string(),
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    passwordConfirmation: Joi.any().valid(Joi.ref('password')).required().options({ language: { any: { allowOnly: 'must match password' } } })
  })
};