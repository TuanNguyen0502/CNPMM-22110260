const { Joi } = require("express-validation");

const registerValidation = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .regex(/[a-zA-Z0-9]{6,30}/)
      .required(),
    name: Joi.string().required(),
  }),
};

const loginValidation = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

module.exports = {
  registerValidation,
  loginValidation,
};
