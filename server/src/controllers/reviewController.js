import Joi from 'joi';
import { Review } from '../models/Review.js';

const reviewPayloadSchema = Joi.object({
  courseCode: Joi.string().trim().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().allow('').optional(),
  reviewedBy: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(null).optional()
}).required();

const updateReviewSchema = Joi.object({
  courseCode: Joi.string().trim(),
  rating: Joi.number().integer().min(1).max(5),
  comment: Joi.string().allow(''),
  reviewedBy: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(null)
}).min(1).required();

// GET /api/reviews
export async function getAllReviews(req, res, next) {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).populate('reviewedBy', 'name email');
    res.json({ reviews });
  } catch (err) { next(err); }
}

// GET /api/reviews/:id
export async function getReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.id).populate('reviewedBy', 'name email');
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ review });
  } catch (err) { next(err); }
}

// GET /api/reviews/summary?courseCode=CS101
export async function getCourseSummary(req, res, next) {
  try {
    const { courseCode } = req.query;
    if (!courseCode || !String(courseCode).trim()) {
      return res.status(400).json({ message: 'courseCode is required' });
    }

    const [summary] = await Review.aggregate([
      { $match: { courseCode: String(courseCode).trim().toUpperCase() } },
      {
        $group: {
          _id: '$courseCode',
          courseCode: { $first: '$courseCode' },
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          courseCode: 1,
          averageRating: { $round: ['$averageRating', 1] },
          reviewCount: 1
        }
      }
    ]);

    if (!summary) {
      return res.status(404).json({ message: 'No reviews found for this course' });
    }

    res.json(summary);
  } catch (err) { next(err); }
}

// POST /api/reviews
export async function createReview(req, res, next) {
  try {
    const { value, error } = reviewPayloadSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: error.message });

    if (value.reviewedBy) {
      const existing = await Review.findOne({ courseCode: value.courseCode, reviewedBy: value.reviewedBy });
      if (existing) {
        return res.status(409).json({ message: 'You already reviewed this course' });
      }
    }

    const review = await Review.create(value);
    const populated = await Review.findById(review._id).populate('reviewedBy', 'name email');
    res.status(201).json({ review: populated });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/reviews/:id
export async function updateReview(req, res, next) {
  try {
    const { value, error } = updateReviewSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: error.message });

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $set: value },
      { new: true, runValidators: true }
    ).populate('reviewedBy', 'name email');

    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ review });
  } catch (err) { next(err); }
}

// DELETE /api/reviews/:id
export async function deleteReview(req, res, next) {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ ok: true, deletedId: req.params.id });
  } catch (err) { next(err); }
}
