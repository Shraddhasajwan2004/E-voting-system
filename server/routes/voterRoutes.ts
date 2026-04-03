import express from 'express';
import { getCandidates, castVote, submitComplaint, updateProfile, getTimeline, getFaceImage } from '../controllers/voterController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/candidates', authenticateToken, getCandidates);
router.post('/vote', authenticateToken, castVote);
router.post('/complaints', authenticateToken, submitComplaint);
router.put('/users/profile', authenticateToken, updateProfile);
router.get('/users/face', authenticateToken, getFaceImage);
router.get('/settings/timeline', getTimeline);

export default router;
