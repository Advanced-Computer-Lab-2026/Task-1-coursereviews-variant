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

// IMPORTANT: /summary must be registered before /:id 
router.get('/summary', getCourseSummary);

router.get('/', getAllReviews);
router.post('/', createReview);
router.get('/:id', getReview);
router.patch('/:id', updateReview);
router.delete('/:id', deleteReview);

export default router;