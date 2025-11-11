import { useGameStore } from '../store/gameStore';
import { useComputerGameStore } from '../store/computerGameStore';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const MoveHistory = () => {
  const location = useLocation();
  const isComputerGame = location.pathname === '/computer';
  
  const practiceGameState = useGameStore((state) => state.gameState);
  const computerGameState = useComputerGameStore((state) => state.gameState);
  
  const gameState = isComputerGame ? computerGameState : practiceGameState;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [gameState.moves.length]);

  const movePairs: Array<[string, string?]> = [];
  for (let i = 0; i < gameState.moves.length; i += 2) {
    movePairs.push([
      gameState.moves[i].san,
      gameState.moves[i + 1]?.san,
    ]);
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-3 h-56">
      <div className="flex items-center mb-2">
        <span className="text-base mr-2">📜</span>
        <h3 className="text-sm font-bold text-gray-800">Moves</h3>
      </div>
      
      <div ref={scrollRef} className="overflow-y-auto h-44 pr-1 text-xs">
        {movePairs.length === 0 ? (
          <p className="text-gray-400 text-xs text-center py-4">No moves yet</p>
        ) : (
          <div className="space-y-0.5">
            {movePairs.map((pair, index) => (
              <div key={index} className="flex items-center hover:bg-gray-50 rounded px-1.5 py-0.5">
                <span className="w-6 text-gray-500 font-medium">{index + 1}.</span>
                <span className="flex-1 font-mono font-semibold">{pair[0]}</span>
                {pair[1] && <span className="flex-1 font-mono text-gray-600">{pair[1]}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
