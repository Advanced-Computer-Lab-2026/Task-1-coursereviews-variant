import Joi from 'joi';
import { Review } from '../models/Review.js';

const createSchema = Joi.object({
  courseCode: Joi.string().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string(),
  reviewedBy: Joi.string()
}).required();

const updateSchema = Joi.object({
  courseCode: Joi.string(),
  rating: Joi.number().integer().min(1).max(5),
  comment: Joi.string(),
  reviewedBy: Joi.string()
}).min(1).required();

// GET /api/reviews
export async function getAllReviews(req, res, next) {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).populate('reviewedBy', 'name email').lean();
    res.json({ reviews });
  } catch (err) { next(err); }
}

// GET /api/reviews/:id
export async function getReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.id).populate('reviewedBy', 'name email').lean();
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ review });
  } catch (err) { next(err); }
}

// GET /api/reviews/summary?courseCode=CS101
export async function getCourseSummary(req, res, next) {
  try {
    const { courseCode } = req.query;
    if (!courseCode || typeof courseCode !== 'string' || !courseCode.trim()) {
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
      },
      {
        $project: {
          _id: 0,
          courseCode: '$_id',
          averageRating: { $round: ['$averageRating', 1] },
          reviewCount: 1
        }
      }
    ]);

    res.json(summary || { courseCode, averageRating: 0, reviewCount: 0 });
  } catch (err) { next(err); }
}

// POST /api/reviews
export async function createReview(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: error.message });

    const review = await Review.create(value);
    const populated = await review.populate('reviewedBy', 'name email');
    res.status(201).json({ review: populated });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'A review for this course already exists for this user' });
    }
    next(err);
  }
}

// PATCH /api/reviews/:id
export async function updateReview(req, res, next) {
  try {
    const { value, error } = updateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: error.message });

    const review = await Review.findByIdAndUpdate(req.params.id, { $set: value }, { new: true, runValidators: true }).populate('reviewedBy', 'name email');
    if (!review) return res.status(404).json({ message: 'Review not found' });
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