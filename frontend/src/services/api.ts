import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (email: string, username: string, password: string) => {
    const response = await api.post('/auth/register', { email, username, password });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Game API
export const gameAPI = {
  saveGame: async (gameData: {
    pgn: string;
    fen: string;
    result: string;
    userColor: string;
    opponent?: string;
    opponentRating?: number;
  }) => {
    const response = await api.post('/games', gameData);
    return response.data;
  },

  getUserGames: async (limit = 20, offset = 0) => {
    const response = await api.get('/games', { params: { limit, offset } });
    return response.data;
  },

  getGameById: async (id: string) => {
    const response = await api.get(`/games/${id}`);
    return response.data;
  },

  deleteGame: async (id: string) => {
    const response = await api.delete(`/games/${id}`);
    return response.data;
  },
};

export default api;
