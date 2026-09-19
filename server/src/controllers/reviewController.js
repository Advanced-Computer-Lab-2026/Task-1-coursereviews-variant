import { Review } from '../models/Review.js';
import { createReviewSchema, updateReviewSchema } from './reviewSchemas.js';

// GET /api/reviews
export async function getAllReviews(req, res, next) {
  try {
    const reviews = await Review.find().populate('reviewedBy', 'name email');
    res.json(reviews);
  } catch (err) { next(err); }
}

// GET /api/reviews/:id
export async function getReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.id).populate('reviewedBy', 'name email');
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json(review);
  } catch (err) { next(err); }
}

// GET /api/reviews/summary?courseCode=CS101
export async function getCourseSummary(req, res, next) {
  try {
    const { courseCode } = req.query;
    if (!courseCode) return res.status(400).json({ error: 'courseCode query param is required' });

    const [result] = await Review.aggregate([
      { $match: { courseCode: courseCode.toUpperCase() } },
      { $group: { _id: '$courseCode', averageRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
    ]);

    res.json({
      courseCode: courseCode.toUpperCase(),
      averageRating: result ? Math.round(result.averageRating * 10) / 10 : null,
      reviewCount: result ? result.reviewCount : 0,
    });
  } catch (err) { next(err); }
}

// POST /api/reviews
export async function createReview(req, res, next) {
  try {
    const { error, value } = createReviewSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const review = await Review.create(value);
    res.status(201).json(review);
  } catch (err) { next(err); }
}

// PATCH /api/reviews/:id
export async function updateReview(req, res, next) {
  try {
    const { error, value } = updateReviewSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const review = await Review.findByIdAndUpdate(req.params.id, value, { new: true })
      .populate('reviewedBy', 'name email');
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json(review);
  } catch (err) { next(err); }
}

// DELETE /api/reviews/:id
export async function deleteReview(req, res, next) {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.status(204).send();
  } catch (err) { next(err); }
}