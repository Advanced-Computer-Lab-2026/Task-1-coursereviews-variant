import Joi from 'joi';
import mongoose from 'mongoose';
import { Review } from '../models/Review.js';

// ---------- Section 2: Validation schemas ----------

const objectId = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message('Invalid id');

const createSchema = Joi.object({
  courseCode: Joi.string().trim().min(2).max(12).required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().allow('').max(1000),
  reviewedBy: objectId
});

const updateSchema = Joi.object({
  courseCode: Joi.string().trim().min(2).max(12),
  rating: Joi.number().integer().min(1).max(5),
  comment: Joi.string().allow('').max(1000),
  reviewedBy: objectId
}).min(1);

// ---------- Section 3: CRUD handlers ----------

// GET /api/reviews
export async function getAllReviews(req, res, next) {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .populate('reviewedBy', 'name email');
    res.json({ reviews });
  } catch (err) { next(err); }
}

// GET /api/reviews/:id
export async function getReview(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }
    const review = await Review.findById(req.params.id)
      .populate('reviewedBy', 'name email');
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ review });
  } catch (err) { next(err); }
}

// ---------- Section 4: Aggregation ----------

// GET /api/reviews/summary?courseCode=CS101
export async function getCourseSummary(req, res, next) {
  try {
    const { courseCode } = req.query;
    if (!courseCode) {
      return res.status(400).json({ message: 'courseCode is required' });
    }

    const code = String(courseCode).trim().toUpperCase();

    const [result] = await Review.aggregate([
      // Stage 1: keep only reviews for this course (uses the index).
      { $match: { courseCode: code } },

      // Stage 2: collapse all matching docs into one summary doc.
      {
        $group: {
          _id: '$courseCode',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      },

      // Stage 3: shape the output — drop _id, rename, round to 1 decimal.
      {
        $project: {
          _id: 0,
          courseCode: '$_id',
          averageRating: { $round: ['$averageRating', 1] },
          reviewCount: 1
        }
      }
    ]);

    if (!result) {
      return res.json({ courseCode: code, averageRating: 0, reviewCount: 0 });
    }

    res.json(result);
  } catch (err) { next(err); }
}

// ---------- Section 3 (continued): create / update / delete ----------

// POST /api/reviews
export async function createReview(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    if (error) return res.status(400).json({ message: error.message });

    const review = await Review.create(value);
    res.status(201).json({ review });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: 'This user has already reviewed this course'
      });
    }
    next(err);
  }
}

// PATCH /api/reviews/:id
export async function updateReview(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const { value, error } = updateSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    if (error) return res.status(400).json({ message: error.message });

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $set: value },
      { new: true, runValidators: true }
    ).populate('reviewedBy', 'name email');

    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ review });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: 'This user has already reviewed this course'
      });
    }
    next(err);
  }
}

// DELETE /api/reviews/:id
export async function deleteReview(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ ok: true });
  } catch (err) { next(err); }
}