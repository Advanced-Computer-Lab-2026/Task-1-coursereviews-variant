import { Review } from '../models/Review.js';
import Joi from 'joi';

const createSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required()
}).unknown(true);

const updateSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5)
}).unknown(true).min(1);

function handleDatabaseError(err, res, next) {
  if (err.code === 11000) {
    return res.status(409).json({
      message: 'This user already reviewed this course'
    });
  }

  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ message: err.message });
  }

  return next(err);
}

// GET /api/reviews
export async function getAllReviews(req, res, next) {
  try {
    const reviews = await Review.find()
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (err) {
    handleDatabaseError(err, res, next);
  }
}

// GET /api/reviews/:id
export async function getReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.id)
      .populate('reviewedBy', 'name email');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ review });
  } catch (err) {
    handleDatabaseError(err, res, next);
  }
}

// GET /api/reviews/summary?courseCode=CS101
export async function getCourseSummary(req, res, next) {
  try {
    const { courseCode } = req.query;

    if (!courseCode) {
      return res.status(400).json({ message: 'courseCode is required' });
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
          averageRating: 1,
          reviewCount: 1
        }
      }
    ]);

    res.json(summary ?? { courseCode, averageRating: null, reviewCount: 0 });
  } catch (err) {
    handleDatabaseError(err, res, next);
  }
}

// POST /api/reviews
export async function createReview(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const review = await Review.create(value);
    res.status(201).json({ review });
  } catch (err) {
    handleDatabaseError(err, res, next);
  }
}

// PATCH /api/reviews/:id
export async function updateReview(req, res, next) {
  try {
    const { value, error } = updateSchema.validate(req.body);
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
    handleDatabaseError(err, res, next);
  }
}

// DELETE /api/reviews/:id
export async function deleteReview(req, res, next) {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ ok: true });
  } catch (err) {
    handleDatabaseError(err, res, next);
  }
}
