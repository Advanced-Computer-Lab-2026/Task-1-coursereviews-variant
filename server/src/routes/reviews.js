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

// Static routes must precede dynamic parameterized routes
router.get('/', getAllReviews);
router.get('/summary', getCourseSummary);

// Dynamic parameterized routes (:id)
router.get('/:id', getReview);
router.post('/', createReview);
router.patch('/:id', updateReview);
router.delete('/:id', deleteReview);

export default router;