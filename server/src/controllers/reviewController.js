import { Review } from '../models/Review.js';
import Joi from 'joi';

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
});

function publicReviewedBy(reviewedBy) {
  if (!reviewedBy) return reviewedBy;
  // Populated user document (or lean object)
  if (typeof reviewedBy === 'object' && reviewedBy.name !== undefined) {
    return {
      id: reviewedBy._id.toString(),
      name: reviewedBy.name,
      email: reviewedBy.email
    };
  }
  return reviewedBy.toString();
}

function publicReview(r) {
  return {
    id: r._id.toString(),
    courseCode: r.courseCode,
    rating: r.rating,
    comment: r.comment,
    reviewedBy: publicReviewedBy(r.reviewedBy),
    createdAt: r.createdAt
  };
}

function isDuplicateKey(err) {
  return err && err.code === 11000;
}

// GET /api/reviews
export async function getAllReviews(req, res, next) {
  try {
    const reviews = await Review.find()
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ reviews: reviews.map(publicReview) });
  } catch (err) { next(err); }
}

// GET /api/reviews/:id
export async function getReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.id).populate('reviewedBy', 'name email');
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ review: publicReview(review) });
  } catch (err) { next(err); }
}

// GET /api/reviews/summary?courseCode=CS101
export async function getCourseSummary(req, res, next) {
  try {
    const { courseCode } = req.query;
    if (!courseCode) {
      return res.status(400).json({ message: 'courseCode query parameter is required' });
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
          averageRating: { $round: ['$averageRating', 1] },
          reviewCount: 1
        }
      }
    ]);

    if (!summary) {
      return res.json({ courseCode, averageRating: null, reviewCount: 0 });
    }

    res.json(summary);
  } catch (err) { next(err); }
}

// POST /api/reviews
export async function createReview(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const existing = await Review.findOne({
      courseCode: value.courseCode,
      reviewedBy: value.reviewedBy
    });
    if (existing) return res.status(409).json({ message: 'Review already created' });

    const review = await Review.create(value);
    res.status(201).json({ review: publicReview(review) });
  } catch (err) {
    if (isDuplicateKey(err)) {
      return res.status(409).json({ message: 'Review already created' });
    }
    next(err);
  }
}

// PATCH /api/reviews/:id
export async function updateReview(req, res, next) {
  try {
    const { value, error } = updateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: error.message });

    const doc = await Review.findByIdAndUpdate(req.params.id, { $set: value }, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ message: 'Review not found' });
    res.json({ review: publicReview(doc) });
  } catch (err) {
    if (isDuplicateKey(err)) {
      return res.status(409).json({ message: 'Review already created' });
    }
    next(err);
  }
}

// DELETE /api/reviews/:id
export async function deleteReview(req, res, next) {
  try {
    const doc = await Review.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Review not found' });
    res.json({ ok: true });
  } catch (err) { next(err); }
}
