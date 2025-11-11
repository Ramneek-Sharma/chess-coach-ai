import { create } from 'zustand';
import { Chess } from 'chess.js';
import { stockfish } from '../services/stockfish';
import { gameAPI } from '../services/api';
import { GameState, Move } from '../types/chess.types';

interface ComputerGameStore {
  game: Chess;
  gameState: GameState;
  playerColor: 'white' | 'black';
  difficulty: number;
  isThinking: boolean;
  isInitializing: boolean;
  initializeGame: (playerColor: 'white' | 'black', difficulty: number) => Promise<void>;
  makePlayerMove: (from: string, to: string, promotion?: string) => Promise<boolean>;
  makeComputerMove: () => Promise<void>;
  resetGame: () => void;
}

const createInitialGameState = (game: Chess): GameState => {
  return {
    fen: game.fen(),
    pgn: game.pgn(),
    moves: [],
    isCheck: game.isCheck(),
    isCheckmate: game.isCheckmate(),
    isDraw: game.isDraw(),
    turn: game.turn(),
    capturedPieces: {
      white: [],
      black: [],
    },
  };
};

export const useComputerGameStore = create<ComputerGameStore>((set, get) => ({
  game: new Chess(),
  gameState: createInitialGameState(new Chess()),
  playerColor: 'white',
  difficulty: 5,
  isThinking: false,
  isInitializing: false,

  initializeGame: async (playerColor: 'white' | 'black', difficulty: number) => {
    set({ isInitializing: true });
    
    try {
      const game = new Chess();
      
      await stockfish.init();
      stockfish.setDifficulty(difficulty);

      set({
        game,
        gameState: createInitialGameState(game),
        playerColor,
        difficulty,
        isThinking: false,
        isInitializing: false,
      });

      if (playerColor === 'black') {
        setTimeout(() => {
          get().makeComputerMove();
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to initialize:', error);
      set({ isInitializing: false });
    }
  },

  makePlayerMove: async (from: string, to: string, promotion?: string) => {
    const { game, playerColor, gameState, isThinking } = get();
    
    if (isThinking) return false;

    const isPlayerTurn = 
      (playerColor === 'white' && game.turn() === 'w') ||
      (playerColor === 'black' && game.turn() === 'b');

    if (!isPlayerTurn) return false;

    try {
      const newGame = new Chess(game.fen());
      
      const move = newGame.move({
        from: from as any,
        to: to as any,
        promotion: promotion as any,
      });

      if (move) {
        const capturedPieces = { ...gameState.capturedPieces };
        if (move.captured) {
          const color = move.color === 'w' ? 'black' : 'white';
          capturedPieces[color].push(move.captured);
        }

        const newMove: Move = {
          from: move.from,
          to: move.to,
          piece: move.piece,
          captured: move.captured,
          promotion: move.promotion,
          san: move.san,
        };

        const newGameState = {
          fen: newGame.fen(),
          pgn: newGame.pgn(),
          moves: [...gameState.moves, newMove],
          isCheck: newGame.isCheck(),
          isCheckmate: newGame.isCheckmate(),
          isDraw: newGame.isDraw(),
          turn: newGame.turn(),
          capturedPieces,
        };

        set({
          game: newGame,
          gameState: newGameState,
        });

        // Save game if it's over
        if (newGame.isGameOver()) {
          setTimeout(async () => {
            try {
              let result = 'draw';
              if (newGame.isCheckmate()) {
                const winner = newGame.turn() === 'w' ? 'black' : 'white';
                result = winner === playerColor ? 'win' : 'loss';
              }

              console.log('💾 Saving computer game:', {
                result,
                playerColor,
                moves: newGameState.moves.length,
              });

              const response = await gameAPI.saveGame({
                pgn: newGameState.pgn,
                fen: newGameState.fen,
                result,
                userColor: playerColor,
                opponent: 'Stockfish AI',
              });

              console.log('✅ Computer game saved:', response.data);
            } catch (error) {
              console.error('❌ Failed to save computer game:', error);
            }
          }, 1000);
        } else {
          setTimeout(() => {
            get().makeComputerMove();
          }, 500);
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error('Invalid move:', error);
      return false;
    }
  },

  makeComputerMove: async () => {
    const { game, gameState, difficulty, playerColor } = get();

    if (game.isGameOver()) return;

    set({ isThinking: true });

    try {
      const bestMove = await stockfish.getBestMove(game.fen(), difficulty);

      if (bestMove && bestMove !== '(none)') {
        const newGame = new Chess(game.fen());
        
        try {
          const move = newGame.move(bestMove);

          if (move) {
            const capturedPieces = { ...gameState.capturedPieces };
            if (move.captured) {
              const color = move.color === 'w' ? 'black' : 'white';
              capturedPieces[color].push(move.captured);
            }

            const newMove: Move = {
              from: move.from,
              to: move.to,
              piece: move.piece,
              captured: move.captured,
              promotion: move.promotion,
              san: move.san,
            };

            const newGameState = {
              fen: newGame.fen(),
              pgn: newGame.pgn(),
              moves: [...gameState.moves, newMove],
              isCheck: newGame.isCheck(),
              isCheckmate: newGame.isCheckmate(),
              isDraw: newGame.isDraw(),
              turn: newGame.turn(),
              capturedPieces,
            };

            set({
              game: newGame,
              gameState: newGameState,
              isThinking: false,
            });

            // Save game if it's over
            if (newGame.isGameOver()) {
              setTimeout(async () => {
                try {
                  let result = 'draw';
                  if (newGame.isCheckmate()) {
                    const winner = newGame.turn() === 'w' ? 'black' : 'white';
                    result = winner === playerColor ? 'win' : 'loss';
                  }

                  console.log('💾 Saving computer game after AI move:', {
                    result,
                    playerColor,
                    moves: newGameState.moves.length,
                  });

                  const response = await gameAPI.saveGame({
                    pgn: newGameState.pgn,
                    fen: newGameState.fen,
                    result,
                    userColor: playerColor,
                    opponent: 'Stockfish AI',
                  });

                  console.log('✅ Computer game saved:', response.data);
                } catch (error) {
                  console.error('❌ Failed to save computer game:', error);
                }
              }, 1000);
            }
          } else {
            console.error('Failed to make computer move');
            set({ isThinking: false });
          }
        } catch (error) {
          console.error('Invalid computer move:', error);
          set({ isThinking: false });
        }
      } else {
        console.log('No move from engine');
        set({ isThinking: false });
      }
    } catch (error) {
      console.error('Computer move error:', error);
      set({ isThinking: false });
    }
  },

  resetGame: () => {
    const game = new Chess();
    set({
      game,
      gameState: createInitialGameState(game),
      isThinking: false,
    });
  },
}));
