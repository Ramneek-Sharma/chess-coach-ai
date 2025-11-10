import express from 'express';
import { getPositionAnalysis, chat, getChatHistory } from '../controllers/coachController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.post('/analyze', getPositionAnalysis);
router.post('/chat', chat);
router.get('/chat/history', getChatHistory);

export default router;
