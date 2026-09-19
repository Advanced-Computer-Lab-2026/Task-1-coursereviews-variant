import Joi from 'joi';
import { Review } from '../models/Review.js';
const createSchema = Joi.object({
  courseCode: Joi.string().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string(),
  reviewedBy: Joi.string()
});

const updateSchema = Joi.object({
  courseCode: Joi.string(),
  rating: Joi.number().integer().min(1).max(5),
  comment: Joi.string(),
  reviewedBy: Joi.string()
}).min(1);

// TODO: write a validation schema for create/update per README.md section 2.

// GET /api/reviews
// TODO: implement per README.md section 3.
export async function getAllReviews(req, res, next) {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (err) {
    next(err);
  }
}

// GET /api/reviews/:id
// TODO: implement per README.md sections 3 and 5.
export async function getReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: 'Review not found'
      });
    }

    res.json({ review });
  } catch (err) {
    next(err);
  }
}

// GET /api/reviews/summary?courseCode=CS101
// TODO: implement per README.md section 4.
export async function getCourseSummary(req, res, next) {
  try {
    const courseCode = req.query.courseCode;

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
          averageRating: {
            $avg: '$rating'
          },
          reviewCount: {
            $sum: 1
          }
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

    res.json(result[0]);
  } catch (err) {
    next(err);
  }
}

// POST /api/reviews
// TODO: implement per README.md section 3.
export async function createReview(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        message: error.message
      });
    }

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
// TODO: implement per README.md sections 3 and 5.
export async function updateReview(req, res, next) {
  try {
    const { value, error } = updateSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        message: error.message
      });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $set: value },
      {
        new: true,
        runValidators: true
      }
    );

    if (!review) {
      return res.status(404).json({
        message: 'Review not found'
      });
    }

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
// TODO: implement per README.md sections 3 and 5.
export async function deleteReview(req, res, next) {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: 'Review not found'
      });
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
