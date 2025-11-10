import { useGameStore } from '../store/gameStore';

export const GameControls = () => {
  const { resetGame, undoMove, gameState } = useGameStore();

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center mb-3">
        <span className="text-lg mr-2">🎮</span>
        <h3 className="text-base font-bold text-gray-800">Controls</h3>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={undoMove}
          disabled={gameState.moves.length === 0}
          className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors font-medium"
        >
          ↶ Undo
        </button>
        
        <button
          onClick={resetGame}
          className="w-full px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors font-medium"
        >
          🔄 New
        </button>
      </div>
      
      <div className="mt-3 pt-3 border-t space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Moves:</span> 
          <span className="font-bold text-green-600">{gameState.moves.length}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Turn:</span>
          <span className="font-bold">{gameState.turn === 'w' ? '⚪' : '⚫'}</span>
        </div>
      </div>
    </div>
  );
};
