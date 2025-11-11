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
      console.log('🎮 Game state check:', {
        isCheckmate: gameState.isCheckmate,
        isDraw: gameState.isDraw,
        movesCount: gameState.moves.length,
      });

      if (gameState.isCheckmate || gameState.isDraw) {
        if (gameState.moves.length > 0) {
          try {
            let result = 'draw';
            if (gameState.isCheckmate) {
              result = gameState.turn === 'w' ? 'loss' : 'win';
            }

            const gameData = {
              pgn: gameState.pgn,
              fen: gameState.fen,
              result,
              userColor: 'white',
              opponent: 'Practice',
            };

            console.log('💾 Saving game to backend:', gameData);
            const response = await gameAPI.saveGame(gameData);
            console.log('✅ Game saved successfully:', response.data);
            
            // Show success message
            setTimeout(() => {
              alert(`Game saved! Result: ${result}. Check your history!`);
            }, 500);
          } catch (error: any) {
            console.error('❌ Failed to save game:', error);
            console.error('Error details:', error.response?.data);
            alert(`Failed to save game: ${error.response?.data?.message || error.message}`);
          }
        } else {
          console.warn('⚠️ Game ended but no moves to save');
        }
      }
    };

    saveGameIfEnded();
  }, [gameState.isCheckmate, gameState.isDraw, gameState.moves.length, gameState.pgn, gameState.fen, gameState.turn]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
      <Navbar />
      
      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-12 gap-4 max-w-[1900px] mx-auto">
          
          <div className="col-span-12 lg:col-span-2 space-y-4">
            <GameControls />
            <CapturedPieces />
          </div>

          <div className="col-span-12 lg:col-span-6 flex items-start justify-center">
            <ChessboardComponent />
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-4">
            <MoveHistory />
            <AICoachChat />
          </div>

        </div>
      </div>
    </div>
  );
};
