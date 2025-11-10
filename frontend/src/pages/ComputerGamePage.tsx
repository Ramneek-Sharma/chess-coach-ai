import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ComputerChessboard } from '../components/ComputerChessboard';
import { MoveHistory } from '../components/MoveHistory';
import { GameControls } from '../components/GameControls';
import { CapturedPieces } from '../components/CapturedPieces';
import { Navbar } from '../components/Navbar';
import { useComputerGameStore } from '../store/computerGameStore';

export const ComputerGamePage = () => {
  const navigate = useNavigate();
  const [showSetup, setShowSetup] = useState(true);
  const [selectedColor, setSelectedColor] = useState<'white' | 'black'>('white');
  const [selectedDifficulty, setSelectedDifficulty] = useState(5);
  const { initializeGame, gameState } = useComputerGameStore();

  const startGame = async () => {
    setShowSetup(false);
    await initializeGame(selectedColor, selectedDifficulty);
  };

  const getDifficultyLabel = (level: number) => {
    if (level <= 3) return 'Beginner';
    if (level <= 7) return 'Intermediate';
    if (level <= 12) return 'Advanced';
    if (level <= 16) return 'Expert';
    return 'Master';
  };

  if (showSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
        <Navbar />
        
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
            <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
              🤖 Play vs Computer
            </h1>
            <p className="text-center text-gray-600 mb-8">
              Test your skills against the AI
            </p>

            {/* Color Selection */}
            <div className="mb-8">
              <label className="block text-lg font-semibold mb-4 text-gray-700">
                Choose Your Color:
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedColor('white')}
                  className={`flex-1 py-6 rounded-xl font-bold text-lg transition-all ${
                    selectedColor === 'white'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ⚪ Play as White
                </button>
                <button
                  onClick={() => setSelectedColor('black')}
                  className={`flex-1 py-6 rounded-xl font-bold text-lg transition-all ${
                    selectedColor === 'black'
                      ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ⚫ Play as Black
                </button>
              </div>
            </div>

            {/* Difficulty Selection */}
            <div className="mb-8">
              <label className="block text-lg font-semibold mb-4 text-gray-700">
                Difficulty Level: <span className="text-green-600">{getDifficultyLabel(selectedDifficulty)} (Level {selectedDifficulty})</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>Easy (1)</span>
                <span>Medium (10)</span>
                <span>Hard (20)</span>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={startGame}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
            >
              🎮 Start Game
            </button>

            <button
              onClick={() => navigate('/game')}
              className="w-full mt-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
            >
              ← Back to Practice
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
      <Navbar />
      
      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-12 gap-4 max-w-[1900px] mx-auto">
          
          <div className="col-span-12 lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-center mb-3">
                <div className="text-sm font-semibold text-gray-600">You are:</div>
                <div className="text-2xl font-bold">
                  {selectedColor === 'white' ? '⚪ White' : '⚫ Black'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-600">Difficulty:</div>
                <div className="text-lg font-bold text-green-600">
                  {getDifficultyLabel(selectedDifficulty)}
                </div>
              </div>
            </div>
            <GameControls />
            <CapturedPieces />
            
            <button
              onClick={() => setShowSetup(true)}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              ⚙️ New Game
            </button>
          </div>

          <div className="col-span-12 lg:col-span-6 flex items-start justify-center">
            <ComputerChessboard />
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-4">
            <MoveHistory />
          </div>

        </div>
      </div>
    </div>
  );
};
