import { Router } from 'express';
import {
  getAllReviews,
  getReview,
  getCourseSummary,
  createReview,
  updateReview,
  deleteReview
} from '../controllers/reviewController.js';

const router = Router();


// GET /api/reviews/summary?courseCode=CS101
router.get('/summary', getCourseSummary);

// GET /api/reviews
router.get('/', getAllReviews);

// GET /api/reviews/:id
router.get('/:id', getReview);

// POST /api/reviews
router.post('/', createReview);

// PATCH /api/reviews/:id
router.patch('/:id', updateReview);

// DELETE /api/reviews/:id
router.delete('/:id', deleteReview);
// TODO: wire up the routes described in README.md section 3.

export default router;
