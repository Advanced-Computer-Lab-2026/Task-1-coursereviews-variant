import Joi from 'joi';
import mongoose from 'mongoose';
import { Review } from '../models/Review.js';

const createReviewSchema = Joi.object({
  courseCode: Joi.string().trim().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().allow('', null).optional(),
  reviewedBy: Joi.string().hex().length(24).optional(),
});

const updateReviewSchema = Joi.object({
  courseCode: Joi.string().trim().optional(),
  rating: Joi.number().integer().min(1).max(5).optional(),
  comment: Joi.string().allow('', null).optional(),
  reviewedBy: Joi.string().hex().length(24).optional(),
}).min(1);

// GET /api/reviews
export async function getAllReviews(req, res, next) {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).populate('reviewedBy', 'name email');
    return res.status(200).json(reviews);
  } catch (err) {
    next(err);
  }
}

// GET /api/reviews/:id
export async function getReview(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid review ID format' });
    }

    const review = await Review.findById(id).populate('reviewedBy', 'name email');
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    return res.status(200).json(review);
  } catch (err) {
    next(err);
  }
}

// GET /api/reviews/summary?courseCode=CS101
export async function getCourseSummary(req, res, next) {
  try {
    const { courseCode } = req.query;
    if (!courseCode) {
      return res.status(400).json({ error: 'courseCode query parameter is required' });
    }

    const summary = await Review.aggregate([
      {
        $match: { courseCode: String(courseCode).trim().toUpperCase() },
      },
      {
        $group: {
          _id: '$courseCode',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          courseCode: '$_id',
          averageRating: { $round: ['$averageRating', 1] },
          reviewCount: 1,
        },
      },
    ]);

    if (!summary.length) {
      return res.status(200).json({
        courseCode: String(courseCode).trim().toUpperCase(),
        averageRating: 0,
        reviewCount: 0,
      });
    }

    return res.status(200).json(summary[0]);
  } catch (err) {
    next(err);
  }
}

// POST /api/reviews
export async function createReview(req, res, next) {
  try {
    const { error, value } = createReviewSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const review = await Review.create(value);
    return res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'User has already reviewed this course.' });
    }
    next(err);
  }
}

// PATCH /api/reviews/:id
export async function updateReview(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid review ID format' });
    }

    const { error, value } = updateReviewSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const review = await Review.findByIdAndUpdate(id, value, {
      new: true,
      runValidators: true,
    }).populate('reviewedBy', 'name email');

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    return res.status(200).json(review);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Duplicate entry violates compound index' });
    }
    next(err);
  }
}

// DELETE /api/reviews/:id
export async function deleteReview(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid review ID format' });
    }

    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    return res.status(200).json({ message: 'Review deleted successfully' });
  } catch (err) {
    next(err);
  }
}
