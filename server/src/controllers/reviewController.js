import { Review } from '../models/Review.js';
import Joi from 'joi';

// TODO: write a validation schema for create/update per README.md section 2.
const createReviewSchema = Joi.object({
  courseCode: Joi.string().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().optional(),
  reviewedBy: Joi.string().optional()
});

const updateReviewSchema = Joi.object({
  courseCode: Joi.string().optional(),
  rating: Joi.number().integer().min(1).max(5).optional(),
  comment: Joi.string().optional(),
  reviewedBy: Joi.string().optional()
});

// GET /api/reviews
// TODO: implement per README.md section 3.
export async function getAllReviews(req, res, next) {
  try {
    // TODO
    const reviews = await Review.find().populate('reviewedBy', 'name email');
    res.status(200).json(reviews);
  } catch (err) { next(err); }
}

// GET /api/reviews/:id
// TODO: implement per README.md sections 3 and 5.
export async function getReview(req, res, next) {
  try {
    // TODO
     const review = await Review.findById(req.params.id)
      .populate('reviewedBy', 'name email');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json(review);
  } catch (err) { next(err); }
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
        $match: { courseCode }
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
          averageRating: 1,
          reviewCount: 1
        }
      }
    ]);

    if (result.length === 0) {
      return res.status(404).json({
        message: 'No reviews found for this course'
      });
    }

    res.status(200).json(result[0]);
  } catch (err) {
    next(err);
  }
}


// POST /api/reviews
// TODO: implement per README.md section 3.
export async function createReview(req, res, next) {
  try {
    // TODO
    const { error, value } = createReviewSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message
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
    // TODO
    const { error, value } = updateReviewSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      value,
      {
        new: true,
        runValidators: true
      }
    ).populate('reviewedBy', 'name email');

    if (!review) {
      return res.status(404).json({
        message: 'Review not found'
      });
    }

    res.status(200).json(review);
  } catch (err) { next(err); }
}

// DELETE /api/reviews/:id
// TODO: implement per README.md sections 3 and 5.
export async function deleteReview(req, res, next) {
  try {
    // TODO
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: 'Review not found'
      });
    }

    res.status(200).json({
      message: 'Review deleted successfully'
    });
  } catch (err) { next(err); }
}
