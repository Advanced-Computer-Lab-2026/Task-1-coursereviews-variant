import Joi from 'joi';

export const createReviewSchema = Joi.object({
  courseCode: Joi.string().trim().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().trim().allow('', null),
  reviewedBy: Joi.string().hex().length(24),
});

export const updateReviewSchema = Joi.object({
  courseCode: Joi.string().trim(),
  rating: Joi.number().integer().min(1).max(5),
  comment: Joi.string().trim().allow('', null),
  reviewedBy: Joi.string().hex().length(24),
}).min(1);