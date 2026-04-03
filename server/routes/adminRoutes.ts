import express from 'express';
import { getResults, getStats, getVoters, updateVoter, getComplaints, updateComplaint, getCandidates, addCandidate, deleteCandidate, updateTimeline } from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken); // Apply to all admin routes

router.get('/results', getResults);
router.get('/stats', getStats);
router.get('/voters', getVoters);
router.put('/voters/:id', updateVoter);
router.get('/complaints', getComplaints);
router.put('/complaints/:id', updateComplaint);
router.get('/candidates', getCandidates);
router.post('/candidates', addCandidate);
router.delete('/candidates/:id', deleteCandidate);
router.put('/settings/timeline', updateTimeline);

export default router;
