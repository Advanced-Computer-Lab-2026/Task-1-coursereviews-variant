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

router.post('/', createReview);
router.get('/', getAllReviews);
router.get('/summary', getCourseSummary);
router.get('/:id', getReview);
router.patch('/:id', updateReview);
router.delete('/:id', deleteReview);

export default router;
