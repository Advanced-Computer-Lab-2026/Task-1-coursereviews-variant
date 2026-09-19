import Joi from 'joi';
import { Review } from '../models/Review.js';

const createSchema = Joi.object({
  courseCode: Joi.string().trim().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().allow('').optional(),
  reviewedBy: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional()
});

const updateSchema = Joi.object({
  courseCode: Joi.string().trim(),
  rating: Joi.number().integer().min(1).max(5),
  comment: Joi.string().allow('').optional(),
  reviewedBy: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional()
}).min(1);

// GET /api/reviews
export async function getAllReviews(req, res, next) {
  try {
    const reviews = await Review.find().populate('reviewedBy', 'name email').sort({ createdAt: -1 }).lean();
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
    const courseCode = req.query.courseCode?.toString().trim().toUpperCase();
    if (!courseCode) {
      return res.status(400).json({ message: 'courseCode query parameter is required' });
    }

    const [summary] = await Review.aggregate([
      { $match: { courseCode } },
      {
        $group: {
          _id: '$courseCode',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      }
    ]);

    if (!summary) {
      return res.status(404).json({ message: 'No reviews found for this course' });
    }

    res.json({
      courseCode: summary._id,
      averageRating: Number(summary.averageRating.toFixed(1)),
      reviewCount: summary.reviewCount
    });
  } catch (err) { next(err); }
}

// POST /api/reviews
export async function createReview(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: error.message });

    const payload = { ...value };
    payload.courseCode = payload.courseCode.toUpperCase();
    if (!payload.reviewedBy) delete payload.reviewedBy;

    const review = await Review.create(payload);
    await review.populate('reviewedBy', 'name email');
    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/reviews/:id
export async function updateReview(req, res, next) {
  try {
    const { value, error } = updateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: error.message });

    if (value.courseCode) value.courseCode = value.courseCode.toUpperCase();
    if (value.reviewedBy === '') delete value.reviewedBy;

    const review = await Review.findByIdAndUpdate(req.params.id, { $set: value }, { new: true, runValidators: true });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    await review.populate('reviewedBy', 'name email');
    res.json({ review });
  } catch (err) { next(err); }
}

// DELETE /api/reviews/:id
export async function deleteReview(req, res, next) {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ ok: true });
  } catch (err) { next(err); }
}
