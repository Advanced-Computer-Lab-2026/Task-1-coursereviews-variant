import { Review } from '../models/Review.js';
import Joi from 'joi';

// Validation schema for create/update
const reviewSchema = Joi.object({
  courseCode: Joi.string()
    .trim()
    .required(),

  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required(),

  comment: Joi.string()
    .trim()
    .optional(),

  reviewedBy: Joi.string()
    .hex()
    .length(24)
    .required(),
});


// GET /api/reviews
export async function getAllReviews(req, res, next) {
  try {
    const reviews = await Review.find();

    res.status(200).json({
      message: "Success",
      data: reviews
    });

  } catch (err) {
    next(err);
  }
}


// GET /api/reviews/:id
export async function getReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found"
      });
    }

    res.status(200).json({
      message: "Success",
      data: review
    });

  } catch (err) {
    next(err);
  }
}


// GET /api/reviews/summary?courseCode=CS101
export async function getCourseSummary(req, res, next) {
  try {
    const { courseCode } = req.query;

    if (!courseCode) {
      return res.status(400).json({
        message: "courseCode is required"
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
          _id: "$courseCode",
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          courseCode: "$_id",
          averageRating: 1,
          reviewCount: 1
        }
      }
    ]);

    if (result.length === 0) {
      return res.status(404).json({
        message: "No reviews found for this course"
      });
    }

    res.status(200).json(result[0]);

  } catch (err) {
    next(err);
  }
}


// POST /api/reviews
export async function createReview(req, res, next) {
  try {
    const { error, value } = reviewSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message
      });
    }

    const review = await Review.create(value);

    res.status(201).json({
      message: "Review created successfully",
      data: review
    });

  } catch (err) {

    // Duplicate user + course combination
    if (err.code === 11000) {
      return res.status(409).json({
        message: "This user has already reviewed this course"
      });
    }

    next(err);
  }
}


// PATCH /api/reviews/:id
export async function updateReview(req, res, next) {
  try {
    const { error, value } = reviewSchema.validate(req.body);

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
    );

    if (!review) {
      return res.status(404).json({
        message: "Review not found"
      });
    }

    res.status(200).json({
      message: "Review updated successfully",
      data: review
    });

  } catch (err) {

    if (err.code === 11000) {
      return res.status(409).json({
        message: "This user has already reviewed this course"
      });
    }

    next(err);
  }
}


// DELETE /api/reviews/:id
export async function deleteReview(req, res, next) {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found"
      });
    }

    res.status(200).json({
      message: "Review deleted successfully",
      data: review
    });

  } catch (err) {
    next(err);
  }
}