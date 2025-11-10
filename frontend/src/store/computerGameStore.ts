import { create } from 'zustand';
import { Chess } from 'chess.js';
import { stockfish } from '../services/stockfish';
import { GameState, Move } from '../types/chess.types';

interface ComputerGameStore {
  game: Chess;
  gameState: GameState;
  playerColor: 'white' | 'black';
  difficulty: number;
  isThinking: boolean;
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

  initializeGame: async (playerColor: 'white' | 'black', difficulty: number) => {
    const game = new Chess();
    
    // Initialize stockfish
    await stockfish.init();
    stockfish.setDifficulty(difficulty);

    set({
      game,
      gameState: createInitialGameState(game),
      playerColor,
      difficulty,
      isThinking: false,
    });

    // If player is black, computer moves first
    if (playerColor === 'black') {
      setTimeout(() => {
        get().makeComputerMove();
      }, 500);
    }
  },

  makePlayerMove: async (from: string, to: string, promotion?: string) => {
    const { game, playerColor, gameState } = get();
    
    // Check if it's player's turn
    const isPlayerTurn = 
      (playerColor === 'white' && game.turn() === 'w') ||
      (playerColor === 'black' && game.turn() === 'b');

    if (!isPlayerTurn) {
      return false;
    }

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

        set({
          game: newGame,
          gameState: {
            fen: newGame.fen(),
            pgn: newGame.pgn(),
            moves: [...gameState.moves, newMove],
            isCheck: newGame.isCheck(),
            isCheckmate: newGame.isCheckmate(),
            isDraw: newGame.isDraw(),
            turn: newGame.turn(),
            capturedPieces,
          },
        });

        // If game not over, let computer move
        if (!newGame.isGameOver()) {
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
    const { game, gameState, difficulty } = get();

    if (game.isGameOver()) return;

    set({ isThinking: true });

    try {
      const bestMove = await stockfish.getBestMove(game.fen(), difficulty);

      if (bestMove) {
        const newGame = new Chess(game.fen());
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

          set({
            game: newGame,
            gameState: {
              fen: newGame.fen(),
              pgn: newGame.pgn(),
              moves: [...gameState.moves, newMove],
              isCheck: newGame.isCheck(),
              isCheckmate: newGame.isCheckmate(),
              isDraw: newGame.isDraw(),
              turn: newGame.turn(),
              capturedPieces,
            },
            isThinking: false,
          });
        }
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
