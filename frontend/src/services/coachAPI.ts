import api from './api';

export const coachAPI = {
  analyzePosition: async (fen: string, lastMove?: string, moveHistory?: string, playerColor?: string) => {
    const response = await api.post('/coach/analyze', { fen, lastMove, moveHistory, playerColor });
    return response.data;
  },

  chat: async (data: {
    message: string;
    conversationHistory: Array<{ role: string; content: string }>;
    currentFen?: string;
    gameId?: string;
    moveHistory?: string;
    playerColor?: string;
  }) => {
    const response = await api.post('/coach/chat', data);
    return response.data;
  },

  getChatHistory: async (gameId?: string) => {
    const response = await api.get('/coach/chat/history', {
      params: { gameId },
    });
    return response.data;
  },
};
