import { useGameStore } from '../store/gameStore';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

const PIECE_SYMBOLS: { [key: string]: string } = {
  'wp': '♙', 'wn': '♘', 'wb': '♗', 'wr': '♖', 'wq': '♕', 'wk': '♔',
  'bp': '♟', 'bn': '♞', 'bb': '♝', 'br': '♜', 'bq': '♛', 'bk': '♚',
};

export const ChessboardComponent = () => {
  const { gameState, makeMove, game } = useGameStore();

  const getPieceAt = (square: string) => {
    const piece = game.get(square as any);
    if (!piece) return null;
    return `${piece.color}${piece.type}`;
  };

  const handleSquareClick = (square: string) => {
    if (gameState.isCheckmate || gameState.isDraw) return;

    const selectedSquare = (window as any).selectedSquare;
    
    if (!selectedSquare) {
      const piece = getPieceAt(square);
      if (piece && piece[0] === gameState.turn) {
        (window as any).selectedSquare = square;
        const squareElement = document.getElementById(`square-${square}`);
        if (squareElement) {
          squareElement.classList.add('selected-square');
        }
      }
    } else {
      const success = makeMove(selectedSquare, square);
      
      const oldSquareElement = document.getElementById(`square-${selectedSquare}`);
      if (oldSquareElement) {
        oldSquareElement.classList.remove('selected-square');
      }
      
      (window as any).selectedSquare = null;
      
      if (!success) {
        const piece = getPieceAt(square);
        if (piece && piece[0] === gameState.turn) {
          (window as any).selectedSquare = square;
          const squareElement = document.getElementById(`square-${square}`);
          if (squareElement) {
            squareElement.classList.add('selected-square');
          }
        }
      }
    }
  };

  return (
    <div className="w-full max-w-[680px]">
      <style>{`
        .selected-square {
          background-color: rgba(255, 255, 100, 0.7) !important;
          box-shadow: inset 0 0 0 3px rgba(255, 200, 0, 0.9);
        }
        .chess-square:hover:not(.game-over) {
          filter: brightness(1.12);
        }
      `}</style>

      {/* Coordinates Top */}
      <div className="flex justify-center mb-2">
        <div className="w-8"></div>
        {FILES.map(file => (
          <div key={file} className="w-20 text-center text-sm font-bold text-gray-600">
            {file.toUpperCase()}
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        {/* Coordinates Left */}
        <div className="flex flex-col justify-around mr-2">
          {RANKS.map(rank => (
            <div key={rank} className="h-20 flex items-center text-sm font-bold text-gray-600 w-8">
              {rank}
            </div>
          ))}
        </div>

        {/* Board - BIGGER squares */}
        <div className="rounded-xl overflow-hidden shadow-2xl" style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          padding: '8px'
        }}>
          {RANKS.map((rank, rankIndex) => (
            <div key={rank} className="flex">
              {FILES.map((file, fileIndex) => {
                const square = `${file}${rank}`;
                const piece = getPieceAt(square);
                const isLight = (rankIndex + fileIndex) % 2 === 0;
                
                return (
                  <div
                    key={square}
                    id={`square-${square}`}
                    onClick={() => handleSquareClick(square)}
                    className={`
                      chess-square w-20 h-20
                      flex items-center justify-center cursor-pointer
                      text-6xl select-none transition-all
                      ${isLight ? 'bg-[#f0d9b5]' : 'bg-[#b58863]'}
                      ${gameState.isCheckmate || gameState.isDraw ? 'game-over cursor-not-allowed opacity-70' : ''}
                    `}
                  >
                    {piece && (
                      <span style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
                        {PIECE_SYMBOLS[piece]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Coordinates Right */}
        <div className="flex flex-col justify-around ml-2">
          {RANKS.map(rank => (
            <div key={rank} className="h-20 flex items-center text-sm font-bold text-gray-600 w-8">
              {rank}
            </div>
          ))}
        </div>
      </div>

      {/* Coordinates Bottom */}
      <div className="flex justify-center mt-2">
        <div className="w-8"></div>
        {FILES.map(file => (
          <div key={file} className="w-20 text-center text-sm font-bold text-gray-600">
            {file.toUpperCase()}
          </div>
        ))}
      </div>
      
      {/* Status */}
      <div className="mt-6">
        {gameState.isCheckmate && (
          <div className="bg-red-500 text-white rounded-xl px-6 py-4 text-center font-bold text-lg">
            🏆 Checkmate! {gameState.turn === 'w' ? 'Black' : 'White'} Wins!
          </div>
        )}
        {gameState.isDraw && !gameState.isCheckmate && (
          <div className="bg-yellow-500 text-white rounded-xl px-6 py-4 text-center font-bold text-lg">
            🤝 Draw
          </div>
        )}
        {gameState.isCheck && !gameState.isCheckmate && !gameState.isDraw && (
          <div className="bg-orange-500 text-white rounded-xl px-6 py-4 text-center font-bold text-lg">
            ⚠️ Check!
          </div>
        )}
        {!gameState.isCheckmate && !gameState.isDraw && !gameState.isCheck && (
          <div className="bg-white rounded-xl px-6 py-4 text-center border-2 border-gray-200">
            <span className="font-bold text-lg text-gray-700">
              {gameState.turn === 'w' ? '⚪ White' : '⚫ Black'}'s Turn
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
