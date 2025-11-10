import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chess } from 'chess.js';
import { gameAPI } from '../services/api';
import { ChessboardComponent } from './Chessboard';

export const GameReplay = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState<any>(null);
  const [chess] = useState(new Chess());
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [moves, setMoves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGame();
  }, [gameId]);

  const loadGame = async () => {
    try {
      const data = await gameAPI.getGameById(gameId!);
      setGame(data.game);
      
      // Parse PGN to get moves
      const tempChess = new Chess();
      tempChess.loadPgn(data.game.pgn);
      const history = tempChess.history({ verbose: true });
      setMoves(history);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load game:', error);
      alert('Failed to load game');
      navigate('/history');
    }
  };

  const goToMove = (index: number) => {
    chess.reset();
    for (let i = 0; i <= index; i++) {
      chess.move(moves[i]);
    }
    setCurrentMoveIndex(index);
  };

  const goToStart = () => {
    chess.reset();
    setCurrentMoveIndex(-1);
  };

  const goToPrevious = () => {
    if (currentMoveIndex >= 0) {
      goToMove(currentMoveIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentMoveIndex < moves.length - 1) {
      goToMove(currentMoveIndex + 1);
    }
  };

  const goToEnd = () => {
    goToMove(moves.length - 1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-600">Loading game...</div>
      </div>
    );
  }

  const currentFen = currentMoveIndex === -1 
    ? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    : chess.fen();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Game Replay
          </h2>
          <button
            onClick={() => navigate('/history')}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Back to History
          </button>
        </div>
        
        <div className="text-gray-600">
          vs {game.opponent} • {new Date(game.played_at).toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chessboard */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
              {/* Simple board display */}
              <div className="text-center mb-4 text-lg font-semibold">
                Move {currentMoveIndex + 1} of {moves.length}
              </div>
              {/* You can reuse ChessboardComponent but make it display-only */}
            </div>

            {/* Controls */}
            <div className="flex justify-center items-center space-x-4 mt-6">
              <button
                onClick={goToStart}
                disabled={currentMoveIndex === -1}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
              >
                ⏮️ Start
              </button>
              <button
                onClick={goToPrevious}
                disabled={currentMoveIndex === -1}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
              >
                ⏪ Previous
              </button>
              <button
                onClick={goToNext}
                disabled={currentMoveIndex === moves.length - 1}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
              >
                ⏩ Next
              </button>
              <button
                onClick={goToEnd}
                disabled={currentMoveIndex === moves.length - 1}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
              >
                ⏭️ End
              </button>
            </div>
          </div>
        </div>

        {/* Move List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Moves</h3>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {moves.map((move, index) => (
                <button
                  key={index}
                  onClick={() => goToMove(index)}
                  className={`w-full text-left px-3 py-2 rounded ${
                    currentMoveIndex === index
                      ? 'bg-green-100 font-semibold'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {Math.floor(index / 2) + 1}.
                  {index % 2 === 0 ? ' ' : '... '}
                  {move.san}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
