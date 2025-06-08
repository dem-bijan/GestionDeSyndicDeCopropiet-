const Joi = require('joi');

exports.changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(8).required()
});

exports.complaintSchema = Joi.object({
  subject: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').default('MEDIUM')
}); 