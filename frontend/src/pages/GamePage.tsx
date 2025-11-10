import { useEffect } from 'react';
import { ChessboardComponent } from '../components/Chessboard';
import { MoveHistory } from '../components/MoveHistory';
import { CapturedPieces } from '../components/CapturedPieces';
import { GameControls } from '../components/GameControls';
import { AICoachChat } from '../components/AICoachChat';
import { Navbar } from '../components/Navbar';
import { useGameStore } from '../store/gameStore';
import { gameAPI } from '../services/api';

export const GamePage = () => {
  const { initializeGame, gameState } = useGameStore();

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    const saveGameIfEnded = async () => {
      if (gameState.isCheckmate || gameState.isDraw) {
        if (gameState.moves.length > 0) {
          try {
            let result = 'draw';
            if (gameState.isCheckmate) {
              result = gameState.turn === 'w' ? 'loss' : 'win';
            }

            await gameAPI.saveGame({
              pgn: gameState.pgn,
              fen: gameState.fen,
              result,
              userColor: 'white',
              opponent: 'Bot',
            });
            
            console.log('Game saved successfully');
          } catch (error) {
            console.error('Failed to save game:', error);
          }
        }
      }
    };

    saveGameIfEnded();
  }, [gameState.isCheckmate, gameState.isDraw, gameState.moves.length, gameState.pgn, gameState.fen, gameState.turn]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
      <Navbar />
      
      <div className="container mx-auto px-4 pb-8">
        {/* Main Grid Layout - Board gets more space */}
        <div className="grid grid-cols-12 gap-4 max-w-[1900px] mx-auto">
          
          {/* Left Column - Controls & Captured */}
          <div className="col-span-12 lg:col-span-2 space-y-4">
            <GameControls />
            <CapturedPieces />
          </div>

          {/* Center Column - Chessboard (BIGGER) */}
          <div className="col-span-12 lg:col-span-7 flex items-start justify-center">
            <ChessboardComponent />
          </div>

          {/* Right Column - History & Chat (SMALLER) */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <MoveHistory />
            <AICoachChat />
          </div>

        </div>
      </div>
    </div>
  );
};
