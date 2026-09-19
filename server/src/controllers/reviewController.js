import Joi from 'joi';
import { Review } from '../models/Review.js';

// TODO: write a validation schema for create/update per README.md section 2.
const createSchema = Joi.object({
  courseCode: Joi.string().trim().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().trim().allow('').optional(),
  reviewedBy: Joi.string().hex().length(24).optional(),
});

const updateSchema = Joi.object({
  courseCode: Joi.string().trim(),
  rating: Joi.number().integer().min(1).max(5),
  comment: Joi.string().trim().allow(''),
  reviewedBy: Joi.string().hex().length(24),
});
function publicReview(r) {
  return {
    id: r._id.toString(),
    courseCode: r.courseCode,
    rating: r.rating,
    comment: r.comment,
    reviewedBy: r.reviewedBy,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

// GET /api/reviews
// TODO: implement per README.md section 3.
export async function getAllReviews(req, res, next) {
  try {
    // TODO
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .populate('reviewedBy', 'name email')
      .lean();
    res.json({ reviews: reviews.map(publicReview) });
  } catch (err) { next(err); }
}

// GET /api/reviews/:id
// TODO: implement per README.md sections 3 and 5.
export async function getReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.id).populate('reviewedBy', 'name email');
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ review: publicReview(review) });
  } catch (err) { next(err); }
}

// GET /api/reviews/summary?courseCode=CS101
// TODO: implement per README.md section 4.
export async function getCourseSummary(req, res, next) {
  try {
    const { courseCode } = req.query;
    if (!courseCode) return res.status(400).json({ message: 'courseCode query param is required' });

    const result = await Review.aggregate([
      { $match: { courseCode: courseCode.trim().toUpperCase() } },
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
          averageRating: { $round: ['$averageRating', 2] },
          reviewCount: 1,
        },
      },
    ]);

    const summary = result[0] || {
      courseCode: courseCode.trim().toUpperCase(),
      averageRating: 0,
      reviewCount: 0,
    };

    res.json({ summary });
  } catch (err) { next(err); }
}

// POST /api/reviews
// TODO: implement per README.md section 3.
export async function createReview(req, res, next) {
  try {
    // TODO
  } catch (err) {
    next(err);
  }
}

// PATCH /api/reviews/:id
// TODO: implement per README.md sections 3 and 5.
export async function updateReview(req, res, next) {
  try {
    // TODO
  } catch (err) { next(err); }
}

// DELETE /api/reviews/:id
// TODO: implement per README.md sections 3 and 5.
export async function deleteReview(req, res, next) {
  try {
    // TODO
  } catch (err) { next(err); }
}
