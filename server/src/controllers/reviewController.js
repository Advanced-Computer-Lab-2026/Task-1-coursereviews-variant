import Joi from 'joi';
import { Review } from '../models/Review.js';

// Validation schema for creating a review
const createSchema = Joi.object({
  courseCode: Joi.string().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().optional(),
  reviewedBy: Joi.string().hex().length(24).optional() 
});

// Validation schema for updating a review (fields are optional)
const updateSchema = Joi.object({
  courseCode: Joi.string(),
  rating: Joi.number().integer().min(1).max(5),
  comment: Joi.string(),
  reviewedBy: Joi.string().hex().length(24)
});

// GET /api/reviews
export async function getAllReviews(req, res, next) {
  try {
    // .populate() added for the stretch goal
    const reviews = await Review.find().populate('reviewedBy', 'name email').lean();
    res.json({ reviews });
  } catch (err) { next(err); }
}

// GET /api/reviews/:id
export async function getReview(req, res, next) {
  try {
    // .populate() added for the stretch goal
    const review = await Review.findById(req.params.id).populate('reviewedBy', 'name email').lean();
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ review });
  } catch (err) { next(err); }
}

// GET /api/reviews/summary?courseCode=CS101
export async function getCourseSummary(req, res, next) {
  try {
    const { courseCode } = req.query;
    if (!courseCode) return res.status(400).json({ message: 'courseCode query parameter is required' });

    const summary = await Review.aggregate([
      // 1. Filter down to only the requested course
      { $match: { courseCode: courseCode } },
      // 2. Group the documents by courseCode and calculate the metrics
      { 
        $group: {
          _id: "$courseCode",
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 }
        }
      },
      // 3. Reshape the output to hide _id and show courseCode
      {
        $project: {
          _id: 0,
          courseCode: "$_id",
          averageRating: 1,
          reviewCount: 1
        }
      }
    ]);

    // If the aggregation returns an empty array, the course has zero reviews
    if (summary.length === 0) {
      return res.json({ courseCode, averageRating: 0, reviewCount: 0 });
    }
    
    res.json(summary[0]);
  } catch (err) { next(err); }
}

// POST /api/reviews
export async function createReview(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const review = await Review.create(value);
    res.status(201).json({ review });
  } catch (err) {
    // Catch duplicate key error from the compound index (one review per user per course)
    if (err.code === 11000) {
      return res.status(409).json({ message: 'User has already reviewed this course' });
    }
    next(err);
  }
}

// PATCH /api/reviews/:id
export async function updateReview(req, res, next) {
  try {
    const { value, error } = updateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: error.message });

    const review = await Review.findByIdAndUpdate(req.params.id, { $set: value }, { new: true, runValidators: true });
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