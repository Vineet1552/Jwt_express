const joi = require('joi');

const dataValidator = joi.object({
  firstName: joi.string().required(),
  lastName: joi.string().required(),
  studentEmail: joi.string().email().required(),
  dailCode: joi.number().required().error(new Error("dail code de de bhai")),
  studentPhone: joi.number().required(),
  pass:joi.string().optional()
});

const MarksValidate = joi.object({
  subject: joi.string().required(),
  marks: joi.string().required()
});

function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  if(typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(" ");
      const token = bearer[1];
      req.token = token;
      next();
  }
  else {
      res.send({
          msg:'invalid token'
      })
  }
}

module.exports = {
  dataValidator,
  MarksValidate,
  verifyToken
};
