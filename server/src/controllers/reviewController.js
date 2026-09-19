import { Review } from '../models/Review.js';

// TODO: write a validation schema for create/update per README.md section 2.
const createSchema = Joi.object({
  courseCode: Joi.string().required(),
  rating: Joi.Number().Integer().min(1).max(5).required(),
  comment: Joi.string().optional(),
  reviewedBy: Joi.string().optional()
});

const updateSchema = Joi.object({
  courseCode: Joi.string().optional(),
  rating: Joi.Number().Integer().min(1).max(5).optional(),
  comment: Joi.string().optional(),
  reviewedBy: Joi.string().optional()
});
// GET /api/reviews
// TODO: implement per README.md section 3.
export async function getAllReviews(req, res, next) {
  try {
    // TODO
  } catch (err) { next(err); }
}

// GET /api/reviews/:id
// TODO: implement per README.md sections 3 and 5.
export async function getReview(req, res, next) {
  try {
    // TODO
  } catch (err) { next(err); }
}

// GET /api/reviews/summary?courseCode=CS101
// TODO: implement per README.md section 4.
export async function getCourseSummary(req, res, next) {
  try {
    // TODO
  } catch (err) { next(err); }
}

// POST /api/reviews
// TODO: implement per README.md section 3.
export async function createReview(req, res, next) {
  try {
    // TODO
  } catch (err) {
    next(err);
  }
}

// PATCH /api/reviews/:id
// TODO: implement per README.md sections 3 and 5.
export async function updateReview(req, res, next) {
  try {
    // TODO
  } catch (err) { next(err); }
}

// DELETE /api/reviews/:id
// TODO: implement per README.md sections 3 and 5.
export async function deleteReview(req, res, next) {
  try {
    // TODO
  } catch (err) { next(err); }
}
