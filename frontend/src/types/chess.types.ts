export interface Move {
  from: string;
  to: string;
  piece: string;
  captured?: string;
  promotion?: string;
  san: string; // Standard Algebraic Notation (e4, Nf3, etc.)
}

export interface GameState {
  fen: string; // Current board position
  pgn: string; // Full game notation
  moves: Move[];
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  turn: 'w' | 'b'; // white or black
  capturedPieces: {
    white: string[];
    black: string[];
  };
}

export interface User {
  id: string;
  email: string;
  username: string;
  rating: number;
}
