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

// IMPORTANT: static route FIRST. If '/:id' were registered before '/summary',
// Express would match '/summary' to '/:id' with id="summary" and the summary
// handler would never run.
router.get('/summary', getCourseSummary);

router.get('/', getAllReviews);
router.get('/:id', getReview);
router.post('/', createReview);
router.patch('/:id', updateReview);
router.delete('/:id', deleteReview);

export default router;