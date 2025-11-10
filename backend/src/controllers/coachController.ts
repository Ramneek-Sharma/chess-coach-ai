import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { analyzePosition, chatWithCoach } from '../services/groqService';
import pool from '../config/database';

export const getPositionAnalysis = async (req: AuthRequest, res: Response) => {
  try {
    const { fen, lastMove, moveHistory, playerColor } = req.body;

    if (!fen) {
      return res.status(400).json({ error: 'FEN position is required' });
    }

    const analysis = await analyzePosition({ 
      fen, 
      lastMove, 
      gameContext: moveHistory,
      playerColor: playerColor || 'white'
    });

    res.json({ analysis });
  } catch (error) {
    console.error('Position analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze position' });
  }
};

export const chat = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { message, conversationHistory, currentFen, moveHistory, gameId, playerColor } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await chatWithCoach(
      message,
      conversationHistory || [],
      currentFen,
      moveHistory,
      playerColor || 'white'
    );

    // Save chat message to database
    if (userId) {
      await pool.query(
        'INSERT INTO chat_messages (user_id, game_id, role, content, position_fen) VALUES ($1, $2, $3, $4, $5)',
        [userId, gameId || null, 'user', message, currentFen || null]
      );

      await pool.query(
        'INSERT INTO chat_messages (user_id, game_id, role, content, position_fen) VALUES ($1, $2, $3, $4, $5)',
        [userId, gameId || null, 'assistant', response, currentFen || null]
      );
    }

    res.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
};

export const getChatHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const gameId = req.query.gameId as string;

    let query = 'SELECT role, content, position_fen, created_at FROM chat_messages WHERE user_id = $1';
    const params: any[] = [userId];

    if (gameId) {
      query += ' AND game_id = $2';
      params.push(gameId);
    }

    query += ' ORDER BY created_at ASC LIMIT 50';

    const result = await pool.query(query, params);

    res.json({ messages: result.rows });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
};
