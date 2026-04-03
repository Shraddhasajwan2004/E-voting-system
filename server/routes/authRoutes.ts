import express from 'express';
import { register, login, faceLogin, verifyVoter, resetPassword, getStates, getCities, getConstituencies } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/face-login', faceLogin);
router.post('/verify-voter', authenticateToken, verifyVoter);
router.post('/reset-password', resetPassword);

router.get('/states', getStates);
router.get('/cities', getCities);
router.get('/constituencies', getConstituencies);

export default router;
