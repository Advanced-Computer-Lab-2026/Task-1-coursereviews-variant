import Joi from 'joi';
import { Review } from '../models/Review.js';

const createReviewSchema = Joi.object({
  courseCode: Joi.string().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().optional(),
  reviewedBy: Joi.any().optional(),
});

const updateReviewSchema = Joi.object({
  courseCode: Joi.string(),
  rating: Joi.number().integer().min(1).max(5),
  comment: Joi.string(),
  reviewedBy: Joi.any(),
}).min(1);

// GET /api/reviews
// TODO: implement per README.md section 3.
export async function getAllReviews(req, res, next) {
  try {
    const reviews = await Review.find();

    res.json(reviews);
  } catch (err) {
    next(err);
  }
}

// GET /api/reviews/:id
// TODO: implement per README.md sections 3 and 5.
export async function getReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.id).populate('reviewedBy');
    if (!review) {
      return res.status(404).json({
        message: 'Review not found'
      });
    }

    res.json(review);
  } catch (err) {
    next(err);
  }
}

// GET /api/reviews/summary?courseCode=CS101
// TODO: implement per README.md section 4.
export async function getCourseSummary(req, res, next) {
  try {
    const { courseCode } = req.query;

    if (!courseCode) {
      return res.status(400).json({
        message: 'courseCode is required'
      });
    }

    const result = await Review.aggregate([
      {
        $match: {
          courseCode: courseCode
        }
      },
      {
        $group: {
          _id: '$courseCode',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      }
    ]);

    if (result.length === 0) {
      return res.json({
        courseCode,
        averageRating: null,
        reviewCount: 0
      });
    }

    res.json({
      courseCode,
      averageRating: result[0].averageRating,
      reviewCount: result[0].reviewCount
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/reviews
// TODO: implement per README.md section 3.
export async function createReview(req, res, next) {
  try {
    const { error, value } = createReviewSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.message
      });
    }

    const review = await Review.create(value);

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/reviews/:id
// TODO: implement per README.md sections 3 and 5.
export async function updateReview(req, res, next) {
  try {
    const { error, value } = updateReviewSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.message
      });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      value,
      {
        new: true,
        runValidators: true
      }
    ).populate('reviewedBy');

    if (!review) {
      return res.status(404).json({
        message: 'Review not found'
      });
    }

    res.json(review);
  } catch (err) {
    next(err);
  }
}


// DELETE /api/reviews/:id
// TODO: implement per README.md sections 3 and 5.
export async function deleteReview(req, res, next) {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: 'Review not found'
      });
    }

    res.json({
      message: 'Review deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}
