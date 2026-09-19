import express from 'express';
import {
  getAllReviews,
  getReview,
  getCourseSummary,
  createReview,
  updateReview,
  deleteReview
} from '../controllers/reviewController.js';

const router = express.Router();

// 1. Static route MUST go first (as warned in your assignment)
router.get('/summary', getCourseSummary);

// 2. Standard routes
router.get('/', getAllReviews);
router.post('/', createReview);

// 3. Dynamic parameterized routes MUST go last
router.get('/:id', getReview);
router.patch('/:id', updateReview);
router.delete('/:id', deleteReview);

export default router;