import { useGameStore } from '../store/gameStore';

const pieceSymbols: { [key: string]: string } = {
  p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚',
};

export const CapturedPieces = () => {
  const { gameState } = useGameStore();

  const renderPieces = (pieces: string[]) => {
    if (pieces.length === 0) {
      return <span className="text-gray-400 text-xs">None</span>;
    }
    return (
      <div className="flex flex-wrap gap-1">
        {pieces.map((piece, index) => (
          <span key={index} className="text-xl">{pieceSymbols[piece]}</span>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center mb-3">
        <span className="text-lg mr-2">⚔️</span>
        <h3 className="text-base font-bold text-gray-800">Captured</h3>
      </div>
      
      <div className="space-y-2">
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-1">⚫ Black:</p>
          {renderPieces(gameState.capturedPieces.black)}
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-1">⚪ White:</p>
          {renderPieces(gameState.capturedPieces.white)}
        </div>
      </div>
    </div>
  );
};
