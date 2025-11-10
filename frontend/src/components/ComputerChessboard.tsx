import { useState } from 'react';
import { useComputerGameStore } from '../store/computerGameStore';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

const PIECE_SYMBOLS: { [key: string]: string } = {
  'wp': '♙', 'wn': '♘', 'wb': '♗', 'wr': '♖', 'wq': '♕', 'wk': '♔',
  'bp': '♟', 'bn': '♞', 'bb': '♝', 'br': '♜', 'bq': '♛', 'bk': '♚',
};

export const ComputerChessboard = () => {
  const { gameState, makePlayerMove, game, isThinking, playerColor } = useComputerGameStore();
  const [showPromotion, setShowPromotion] = useState(false);
  const [promotionMove, setPromotionMove] = useState<{ from: string; to: string } | null>(null);

  const getPieceAt = (square: string) => {
    const piece = game.get(square as any);
    if (!piece) return null;
    return `${piece.color}${piece.type}`;
  };

  const isPromotionMove = (from: string, to: string): boolean => {
    const piece = game.get(from as any);
    if (!piece || piece.type !== 'p') return false;
    
    const toRank = to[1];
    if (piece.color === 'w' && toRank === '8') return true;
    if (piece.color === 'b' && toRank === '1') return true;
    
    return false;
  };

  const handlePromotion = async (piece: string) => {
    if (promotionMove) {
      await makePlayerMove(promotionMove.from, promotionMove.to, piece);
      setShowPromotion(false);
      setPromotionMove(null);
      
      const oldSquareElement = document.getElementById(`comp-square-${promotionMove.from}`);
      if (oldSquareElement) {
        oldSquareElement.classList.remove('selected-square');
      }
      (window as any).selectedSquare = null;
    }
  };

  const handleSquareClick = async (square: string) => {
    if (gameState.isCheckmate || gameState.isDraw || isThinking) return;

    const selectedSquare = (window as any).selectedSquare;
    
    if (!selectedSquare) {
      const piece = getPieceAt(square);
      const isPlayerPiece = 
        (playerColor === 'white' && piece && piece[0] === 'w') ||
        (playerColor === 'black' && piece && piece[0] === 'b');

      if (isPlayerPiece && piece && piece[0] === gameState.turn) {
        (window as any).selectedSquare = square;
        const squareElement = document.getElementById(`comp-square-${square}`);
        if (squareElement) {
          squareElement.classList.add('selected-square');
        }
      }
    } else {
      if (isPromotionMove(selectedSquare, square)) {
        setPromotionMove({ from: selectedSquare, to: square });
        setShowPromotion(true);
        return;
      }

      const success = await makePlayerMove(selectedSquare, square);
      
      const oldSquareElement = document.getElementById(`comp-square-${selectedSquare}`);
      if (oldSquareElement) {
        oldSquareElement.classList.remove('selected-square');
      }
      
      (window as any).selectedSquare = null;
      
      if (!success) {
        const piece = getPieceAt(square);
        const isPlayerPiece = 
          (playerColor === 'white' && piece && piece[0] === 'w') ||
          (playerColor === 'black' && piece && piece[0] === 'b');

        if (isPlayerPiece && piece && piece[0] === gameState.turn) {
          (window as any).selectedSquare = square;
          const squareElement = document.getElementById(`comp-square-${square}`);
          if (squareElement) {
            squareElement.classList.add('selected-square');
          }
        }
      }
    }
  };

  const displayRanks = playerColor === 'white' ? RANKS : [...RANKS].reverse();
  const displayFiles = playerColor === 'white' ? FILES : [...FILES].reverse();

  return (
    <div className="w-full max-w-[680px] relative">
      <style>{`
        .selected-square {
          background-color: rgba(255, 255, 100, 0.7) !important;
          box-shadow: inset 0 0 0 3px rgba(255, 200, 0, 0.9);
        }
        .chess-square:hover:not(.game-over):not(.thinking) {
          filter: brightness(1.12);
        }
      `}</style>

      {/* Promotion Dialog */}
      {showPromotion && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-xl">
          <div className="bg-white rounded-xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-center mb-4">Promote to:</h3>
            <div className="flex gap-4">
              <button onClick={() => handlePromotion('q')} className="w-20 h-20 bg-gray-100 hover:bg-gray-200 rounded-lg text-6xl">
                {gameState.turn === 'w' ? '♕' : '♛'}
              </button>
              <button onClick={() => handlePromotion('r')} className="w-20 h-20 bg-gray-100 hover:bg-gray-200 rounded-lg text-6xl">
                {gameState.turn === 'w' ? '♖' : '♜'}
              </button>
              <button onClick={() => handlePromotion('b')} className="w-20 h-20 bg-gray-100 hover:bg-gray-200 rounded-lg text-6xl">
                {gameState.turn === 'w' ? '♗' : '♝'}
              </button>
              <button onClick={() => handlePromotion('n')} className="w-20 h-20 bg-gray-100 hover:bg-gray-200 rounded-lg text-6xl">
                {gameState.turn === 'w' ? '♘' : '♞'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thinking Indicator */}
      {isThinking && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-2 rounded-full shadow-lg z-40 animate-pulse">
          🤔 Computer is thinking...
        </div>
      )}

      <div className="flex justify-center mb-2">
        <div className="w-8"></div>
        {displayFiles.map(file => (
          <div key={file} className="w-20 text-center text-sm font-bold text-gray-600">{file.toUpperCase()}</div>
        ))}
      </div>

      <div className="flex justify-center">
        <div className="flex flex-col justify-around mr-2">
          {displayRanks.map(rank => (
            <div key={rank} className="h-20 flex items-center text-sm font-bold text-gray-600 w-8">{rank}</div>
          ))}
        </div>

        <div className="rounded-xl overflow-hidden shadow-2xl" style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          padding: '8px'
        }}>
          {displayRanks.map((rank, rankIndex) => (
            <div key={rank} className="flex">
              {displayFiles.map((file, fileIndex) => {
                const square = `${file}${rank}`;
                const piece = getPieceAt(square);
                const isLight = (RANKS.indexOf(rank) + FILES.indexOf(file)) % 2 === 0;
                
                return (
                  <div
                    key={square}
                    id={`comp-square-${square}`}
                    onClick={() => handleSquareClick(square)}
                    className={`
                      chess-square w-20 h-20 flex items-center justify-center cursor-pointer
                      text-6xl select-none transition-all
                      ${isLight ? 'bg-[#f0d9b5]' : 'bg-[#b58863]'}
                      ${gameState.isCheckmate || gameState.isDraw ? 'game-over cursor-not-allowed opacity-70' : ''}
                      ${isThinking ? 'thinking cursor-wait' : ''}
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

        <div className="flex flex-col justify-around ml-2">
          {displayRanks.map(rank => (
            <div key={rank} className="h-20 flex items-center text-sm font-bold text-gray-600 w-8">{rank}</div>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-2">
        <div className="w-8"></div>
        {displayFiles.map(file => (
          <div key={file} className="w-20 text-center text-sm font-bold text-gray-600">{file.toUpperCase()}</div>
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
        {!gameState.isCheckmate && !gameState.isDraw && !gameState.isCheck && !isThinking && (
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
