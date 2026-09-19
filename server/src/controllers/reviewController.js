import Joi from 'joi';
import { Review } from '../models/Review.js';
// TODO: write a validation schema for create/update per README.md section 2.

const objectId = Joi.string().hex().length(24);

const createReviewSchema = Joi.object({
  courseCode: Joi.string().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string(),
  reviewedBy: objectId
});

const updateReviewSchema = Joi.object({
  courseCode: Joi.string(),
  rating: Joi.number().integer().min(1).max(5),
  comment: Joi.string(),
  reviewedBy: objectId
});
// GET /api/reviews
// TODO: implement per README.md section 3.
export async function getAllReviews(req, res, next) {
  try {
    const reviews = await Review.find();
    res.status(200).json(reviews);
  } catch (err) { next(err); }
}

// GET /api/reviews/:id
// TODO: implement per README.md sections 3 an  d 5.
export async function getReview(req, res, next) {
  try {
    const {error} = objectId.validate(req.params.id);
    if (error){
      return res.status(400).json({
        message: 'Invalid Review ID'
      });
    }
  const review = await Review.findById(req.params.id).populate('reviewedBy', 'name email');
  if (!review){
    return res.status(404).json({
      message: 'Review not Found'
    });
  }
  res.status(200).json(review);
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
