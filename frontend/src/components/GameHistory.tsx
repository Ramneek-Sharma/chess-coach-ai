import { useState, useEffect } from 'react';
import { gameAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface Game {
  id: string;
  pgn: string;
  result: string;
  user_color: string;
  opponent: string;
  played_at: string;
}

export const GameHistory = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const data = await gameAPI.getUserGames(50, 0);
      setGames(data.games);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to load games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewGame = (gameId: string) => {
    navigate(`/replay/${gameId}`);
  };

  const handleDeleteGame = async (gameId: string) => {
    if (!window.confirm('Are you sure you want to delete this game?')) {
      return;
    }

    try {
      await gameAPI.deleteGame(gameId);
      setGames(games.filter(g => g.id !== gameId));
      setTotal(total - 1);
    } catch (error) {
      console.error('Failed to delete game:', error);
      alert('Failed to delete game');
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'win':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">Win</span>;
      case 'loss':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">Loss</span>;
      case 'draw':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">Draw</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">Unknown</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading games...</div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <div className="text-6xl mb-4">♟️</div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
          No games yet
        </h3>
        <p className="text-gray-600 mb-6">
          Start playing to build your game history!
        </p>
        <button
          onClick={() => navigate('/game')}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Play Now
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Game History
        </h2>
        <p className="text-gray-600">
          Total games: <span className="font-semibold">{total}</span>
        </p>
      </div>

      <div className="space-y-3">
        {games.map((game) => (
          <div
            key={game.id}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  <div className="text-2xl">
                    {game.user_color === 'white' ? '⚪' : '⚫'}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">
                      vs {game.opponent}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(game.played_at)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {getResultBadge(game.result)}
                
                <button
                  onClick={() => handleViewGame(game.id)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Review
                </button>
                
                <button
                  onClick={() => handleDeleteGame(game.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
