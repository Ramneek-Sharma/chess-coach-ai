import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const saveGame = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { pgn, fen, result, userColor, opponent, opponentRating } = req.body;

    if (!pgn) {
      return res.status(400).json({ error: 'PGN is required' });
    }

    const gameResult = await pool.query(
      `INSERT INTO games (user_id, pgn, fen, source, result, user_color, opponent, opponent_rating, played_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING id, pgn, result, played_at`,
      [userId, pgn, fen, 'platform', result, userColor, opponent || 'Bot', opponentRating]
    );

    res.status(201).json({
      message: 'Game saved successfully',
      game: gameResult.rows[0],
    });
  } catch (error) {
    console.error('Save game error:', error);
    res.status(500).json({ error: 'Failed to save game' });
  }
};

export const getUserGames = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await pool.query(
      `SELECT id, pgn, fen, result, user_color, opponent, opponent_rating, played_at, analyzed
       FROM games
       WHERE user_id = $1
       ORDER BY played_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM games WHERE user_id = $1',
      [userId]
    );

    res.json({
      games: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ error: 'Failed to get games' });
  }
};

export const getGameById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const gameId = req.params.id;

    const result = await pool.query(
      `SELECT id, pgn, fen, result, user_color, opponent, opponent_rating, played_at, analyzed
       FROM games
       WHERE id = $1 AND user_id = $2`,
      [gameId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json({ game: result.rows[0] });
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({ error: 'Failed to get game' });
  }
};

export const deleteGame = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const gameId = req.params.id;

    const result = await pool.query(
      'DELETE FROM games WHERE id = $1 AND user_id = $2 RETURNING id',
      [gameId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({ error: 'Failed to delete game' });
  }
};
