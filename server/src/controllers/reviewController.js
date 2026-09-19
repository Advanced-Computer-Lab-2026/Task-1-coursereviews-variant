import Joi from 'joi';// JOI is a way to monitor the incoming data used for the 1-5 rating 
import { Review } from '../models/Review.js';

// TODO: write a validation schema for create/update per README.md section 2.
const createSchema = Joi.object({
  courseCode: Joi.string().required(), // it must be a string
  rating: Joi.number().integer().min(1).max(5).required(), // it must be an integer with a certian range 
  comment: Joi.string(), // optional but string
  reviewedBy: Joi.string() // optional but string
});//nothing is required because i might just be updating one field 
const updateSchema = Joi.object({
  courseCode: Joi.string(),
  rating: Joi.number().integer().min(1).max(5),
  comment: Joi.string(),
  reviewedBy: Joi.string()
});


// GET /api/reviews
// TODO: implement per README.md section 3.
export async function getAllReviews(req, res, next) {
  try {
      const reviews = await Review.find().sort({ createdAt: -1 });// we get from the reviews model all thedocuments in mangodb and sort them 

    res.json({ reviews });
  } catch (err) { next(err); }
}

// GET /api/reviews/:id
// TODO: implement per README.md sections 3 and 5.
export async function getReview(req, res, next) {
  try {
    const review = await Review.findById(req.params.id);// get the id of the review we want 
     if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }// case where this review does not even exist
    res.json({ review });

  } catch (err) { next(err); }
}

// GET /api/reviews/summary?courseCode=CS101
// TODO: implement per README.md section 4.
export async function getCourseSummary(req, res, next) {
  try {
    const { courseCode } = req.query; // we are getting the course code from the URL 

    if (!courseCode) {
      return res.status(400).json({ message: 'courseCode is required' });
    }
    const result = await Review.aggregate([//mongoose always gives you an array of aggregation results
      {
        $match: { courseCode }
      },
      {
        $group: {
          _id: '$courseCode',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      }
    ]);

    const summary = result[0];// turning from Array to the required format 

    res.json({
      courseCode,
      averageRating: summary ? summary.averageRating : 0,
      reviewCount: summary ? summary.reviewCount : 0
    });

  } catch (err) {
    next(err);
  }
}






  

// POST /api/reviews
// TODO: implement per README.md section 3.
export async function createReview(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.message });
    }
    const review = await Review.create(value);

    res.status(201).json({ review });

  } catch (err) {
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
      return res.status(400).json({ message: error.message });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $set: value },
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ review });

  } catch (err) {
    next(err);
  }
}
// DELETE /api/reviews/:id
// TODO: implement per README.md sections 3 and 5.
export async function deleteReview(req, res, next) {
  try {
    const review = await Review.findByIdAndDelete(req.params.id); // get the id and delete

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ ok: true });
  } catch (err) { next(err); }
}
