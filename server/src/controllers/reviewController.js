import Joi from 'joi';
import { Review } from '../models/Review.js';

const reviewSchema = Joi.object({
  courseCode: Joi.string().trim().uppercase().required().messages({
    'string.empty': 'Course code cannot be empty',
    'any.required': 'Course code is required'
  }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.base': 'Rating must be a number',
    'number.integer': 'Rating must be an integer',
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating must be at most 5',
    'any.required': 'Rating is required'
  }),
  comment: Joi.string().trim().max(500).allow('').optional().messages({
    'string.max': 'Comment must be less than 500 characters'
  }),
  reviewedBy: Joi.string().hex().length(24).allow(null).optional().messages({
    'string.hex': 'Invalid user ID format',
    'string.length': 'Invalid user ID length'
  })
}).required();

function normalizeReviewPayload(payload) {
  const cleaned = { ...payload };
  if (cleaned.comment === undefined || cleaned.comment === null) cleaned.comment = '';
  if (cleaned.reviewedBy === undefined || cleaned.reviewedBy === null || cleaned.reviewedBy === '') {
    cleaned.reviewedBy = null;
  }
  return cleaned;
}

export async function getAllReviews(req, res, next) {
  try {
    const reviews = await Review.find().populate('reviewedBy', 'name email').sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
}

export async function getReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.id).populate('reviewedBy', 'name email');
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json(review);
  } catch (err) {
    next(err);
  }
}

export async function getCourseSummary(req, res, next) {
  try {
    const { courseCode } = req.query;
    if (!courseCode || String(courseCode).trim() === '') {
      return res.status(400).json({ message: 'courseCode query parameter is required' });
    }

    const summary = await Review.aggregate([
      { $match: { courseCode: String(courseCode).trim().toUpperCase() } },
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

    if (!summary.length) {
      return res.status(404).json({ message: `No reviews found for course ${String(courseCode).trim().toUpperCase()}` });
    }

    res.json(summary[0]);
  } catch (err) {
    next(err);
  }
}

export async function createReview(req, res, next) {
  try {
    const { error, value } = reviewSchema.validate(req.body, { abortEarly: false, convert: true });
    if (error) {
      return res.status(400).json({
        errors: error.details.map((detail) => detail.message)
      });
    }

    const cleaned = normalizeReviewPayload(value);
    const existingReview = await Review.findOne({
      courseCode: cleaned.courseCode,
      reviewedBy: cleaned.reviewedBy || null
    });

    if (existingReview) {
      return res.status(409).json({ message: 'You have already reviewed this course' });
    }

    const review = await Review.create(cleaned);
    const populatedReview = await review.populate('reviewedBy', 'name email');
    res.status(201).json(populatedReview);
  } catch (err) {
    next(err);
  }
}

export async function updateReview(req, res, next) {
  try {
    const { error, value } = reviewSchema.validate(req.body, {
      abortEarly: false,
      convert: true,
      allowUnknown: false
    });

    if (error) {
      return res.status(400).json({
        errors: error.details.map((detail) => detail.message)
      });
    }

    const cleaned = normalizeReviewPayload(value);
    const review = await Review.findByIdAndUpdate(req.params.id, cleaned, {
      new: true,
      runValidators: true
    }).populate('reviewedBy', 'name email');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (err) {
    next(err);
  }
}

export async function deleteReview(req, res, next) {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    next(err);
  }
}