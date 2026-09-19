import Review from '../models/Review.js';
import Joi from 'joi';

// TODO: write a validation schema for create/update per README.md section 2.
const reviewValidationSchema = Joi.object({
  courseCode: Joi.string().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().optional(),
  reviewedBy: Joi.string().hex().length(24).optional()
});

// GET /api/reviews
// TODO: implement per README.md section 3.
export async function getAllReviews(req, res, next) {
  try {
    //TODO
    const reviews = await Review.find().populate('reviewedBy', 'name email'); // populating reviewedBy field with name and email
    res.status(200).json(reviews);
  } catch (err) { next(err); }
}

// GET /api/reviews/:id
// TODO: implement per README.md sections 3 and 5.
export async function getReview(req, res, next) {
  try {
    // TODO
    const review = await Review.findById(req.params.id).populate('reviewedBy', 'name email');
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.status(200).json(review);
  } catch (err) { next(err); }
}

// GET /api/reviews/summary?courseCode=CS101
// TODO: implement per README.md section 4.
export async function getCourseSummary(req, res, next) {
  try {
    // TODO
    //1. extracting courseCode from query parameters
    const { courseCode } = req.query;
    if (!courseCode) {
      return res.status(400).json({ error: 'courseCode query parameter is required' });
    }

    //2. The Aggregation Pipeline
    const summary = await Review.aggregate([
      { $match: {courseCode: courseCode} },

      { $group: {
        _id: '$courseCode',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
    ]);

    if (summary.length === 0) {
      return res.status(404).json({ error: 'No reviews found for this course' });
    }

    res.status(200).json({
      courseCode: summary[0]._id,
      averageRating: Math.round(summary[0].averageRating * 10) / 10, // rounding to 1 decimal place
      reviewCount: summary[0].reviewCount
    });
  } catch (err) { next(err); }
}

// POST /api/reviews
// TODO: implement per README.md section 3.
export async function createReview(req, res, next) {
  try {
    // TODO
    const {error} = reviewValidationSchema.validate(req.body);
    if(error){
      return res.status(400).json({error: error.details[0].message});
    }
    const review = await Review.create(req.body);
    res.status(201).json(review);
  } catch (err) {
    //Catching compound unique index violation (one review per user per course)
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Review already exists for this course and user' });
    }
    next(err);
  }
}

// PATCH /api/reviews/:id
// TODO: implement per README.md sections 3 and 5.
export async function updateReview(req, res, next) {
  try {
    // TODO
    const {error} = reviewValidationSchema.validate(req.body);
    if(error){
      return res.status(400).json({error: error.details[0].message});
    }
    //{ new: true } tells Mongoose to return the updated document, not the old one
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
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
      return res.status(404).json({ error: 'Review not found' });
    }
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (err) { next(err); }
}
