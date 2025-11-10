import { create } from 'zustand';
import { Chess, Square } from 'chess.js';
import { GameState, Move } from '../types/chess.types';

interface GameStore {
  game: Chess;
  gameState: GameState;
  initializeGame: () => void;
  makeMove: (from: string, to: string, promotion?: string) => boolean;
  undoMove: () => void;
  resetGame: () => void;
  loadGame: (pgn: string) => void;
}

const createInitialGameState = (game: Chess): GameState => {
  return {
    fen: game.fen(),
    pgn: game.pgn(),
    moves: [],
    isCheck: game.isCheck(),
    isCheckmate: game.isCheckmate(),
    isDraw: game.isDraw() || game.isStalemate() || game.isThreefoldRepetition() || game.isInsufficientMaterial(),
    turn: game.turn(),
    capturedPieces: {
      white: [],
      black: [],
    },
  };
};

const getCapturedPieces = (game: Chess) => {
  const history = game.history({ verbose: true });
  const captured = { white: [] as string[], black: [] as string[] };
  
  history.forEach(move => {
    if (move.captured) {
      const color = move.color === 'w' ? 'black' : 'white';
      captured[color].push(move.captured);
    }
  });
  
  return captured;
};

export const useGameStore = create<GameStore>((set, get) => ({
  game: new Chess(),
  gameState: createInitialGameState(new Chess()),

  initializeGame: () => {
    const game = new Chess();
    set({
      game,
      gameState: createInitialGameState(game),
    });
  },

  makeMove: (from: string, to: string, promotion?: string) => {
    const { game } = get();
    
    try {
      const move = game.move({
        from: from as Square,
        to: to as Square,
        promotion: promotion as any,
      });

      if (move) {
        const history = game.history({ verbose: true });
        const moves: Move[] = history.map(m => ({
          from: m.from,
          to: m.to,
          piece: m.piece,
          captured: m.captured,
          promotion: m.promotion,
          san: m.san,
        }));

        set({
          gameState: {
            fen: game.fen(),
            pgn: game.pgn(),
            moves,
            isCheck: game.isCheck(),
            isCheckmate: game.isCheckmate(),
            isDraw: game.isDraw() || game.isStalemate() || game.isThreefoldRepetition() || game.isInsufficientMaterial(),
            turn: game.turn(),
            capturedPieces: getCapturedPieces(game),
          },
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error('Invalid move:', error);
      return false;
    }
  },

  undoMove: () => {
    const { game } = get();
    const undoneMove = game.undo();
    
    if (undoneMove) {
      const history = game.history({ verbose: true });
      const moves: Move[] = history.map(m => ({
        from: m.from,
        to: m.to,
        piece: m.piece,
        captured: m.captured,
        promotion: m.promotion,
        san: m.san,
      }));

      set({
        gameState: {
          fen: game.fen(),
          pgn: game.pgn(),
          moves,
          isCheck: game.isCheck(),
          isCheckmate: game.isCheckmate(),
          isDraw: game.isDraw() || game.isStalemate() || game.isThreefoldRepetition() || game.isInsufficientMaterial(),
          turn: game.turn(),
          capturedPieces: getCapturedPieces(game),
        },
      });
    }
  },

  resetGame: () => {
    const game = new Chess();
    set({
      game,
      gameState: createInitialGameState(game),
    });
  },

  loadGame: (pgn: string) => {
    const game = new Chess();
    game.loadPgn(pgn);
    
    const history = game.history({ verbose: true });
    const moves: Move[] = history.map(m => ({
      from: m.from,
      to: m.to,
      piece: m.piece,
      captured: m.captured,
      promotion: m.promotion,
      san: m.san,
    }));
    
    set({
      game,
      gameState: {
        fen: game.fen(),
        pgn: game.pgn(),
        moves,
        isCheck: game.isCheck(),
        isCheckmate: game.isCheckmate(),
        isDraw: game.isDraw() || game.isStalemate() || game.isThreefoldRepetition() || game.isInsufficientMaterial(),
        turn: game.turn(),
        capturedPieces: getCapturedPieces(game),
      },
    });
  },
}));
