import express from 'express';
import { saveGame, getUserGames, getGameById, deleteGame } from '../controllers/gameController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All game routes require authentication
router.use(authenticateToken);

router.post('/', saveGame);
router.get('/', getUserGames);
router.get('/:id', getGameById);
router.delete('/:id', deleteGame);

export default router;
