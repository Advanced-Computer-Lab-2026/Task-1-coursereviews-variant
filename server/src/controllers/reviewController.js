import Joi from 'joi';
import { Review } from '../models/Review.js';

// Validation schemas per README.md section 2
const createReviewSchema = Joi.object({
  courseCode: Joi.string().trim().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().trim().allow('', null).optional(),
  reviewedBy: Joi.string().hex().length(24).allow(null).optional()
});

const updateReviewSchema = Joi.object({
  courseCode: Joi.string().trim(),
  rating: Joi.number().integer().min(1).max(5),
  comment: Joi.string().trim().allow('', null),
  reviewedBy: Joi.string().hex().length(24).allow(null)
});

// GET /api/reviews
// Implemented per README.md sections 3 and 5 (populate)
export async function getAllReviews(req, res, next) {
  try {
    const reviews = await Review.find()
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ reviews });
  } catch (err) {
    next(err);
  }
}

// GET /api/reviews/:id
// Implemented per README.md sections 3 and 5 (populate)
export async function getReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.id)
      .populate('reviewedBy', 'name email');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ review });
  } catch (err) {
    next(err);
  }
}

// GET /api/reviews/summary?courseCode=CS101
// Implemented per README.md section 4 (Mongoose aggregation pipeline)
export async function getCourseSummary(req, res, next) {
  try {
    const { courseCode } = req.query;

    if (!courseCode) {
      return res.status(400).json({ message: 'courseCode query parameter is required' });
    }

    const normalizedCode = courseCode.trim().toUpperCase();

    const [summary] = await Review.aggregate([
      {
        $match: { courseCode: normalizedCode }
      },
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

    if (!summary) {
      return res.json({
        courseCode: normalizedCode,
        averageRating: 0,
        reviewCount: 0
      });
    }

    res.json(summary);
  } catch (err) {
    next(err);
  }
}

// POST /api/reviews
// Implemented per README.md section 3
export async function createReview(req, res, next) {
  try {
    const { value, error } = createReviewSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const review = await Review.create(value);
    res.status(201).json({ review });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'User has already reviewed this course' });
    }
    next(err);
  }
}

// PATCH /api/reviews/:id
// Implemented per README.md sections 3 and 5
export async function updateReview(req, res, next) {
  try {
    const { value, error } = updateReviewSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $set: value },
      { new: true, runValidators: true }
    ).populate('reviewedBy', 'name email');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ review });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'User has already reviewed this course' });
    }
    next(err);
  }
}

// DELETE /api/reviews/:id
// Implemented per README.md sections 3 and 5
export async function deleteReview(req, res, next) {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}