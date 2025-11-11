import { Chess } from 'chess.js';
import { stockfish } from './stockfish';

export interface MoveAnalysis {
  moveNumber: number;
  move: string;
  fen: string;
  evaluation: number;
  bestMove: string | null;
  classification: 'brilliant' | 'great' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'book';
  evaluationDrop?: number;
}

export interface GameAnalysisResult {
  moves: MoveAnalysis[];
  accuracy: {
    white: number;
    black: number;
  };
  summary: {
    brilliantMoves: number;
    greatMoves: number;
    goodMoves: number;
    inaccuracies: number;
    mistakes: number;
    blunders: number;
  };
  averageEvaluation: number;
}

class GameAnalysisService {
  async analyzeGame(pgn: string, onProgress?: (progress: number) => void): Promise<GameAnalysisResult> {
    const chess = new Chess();
    chess.loadPgn(pgn);
    
    const history = chess.history({ verbose: true });
    const moveAnalyses: MoveAnalysis[] = [];
    
    // Reset to start
    chess.reset();
    
    let previousEval = 0;
    
    // Analyze each move
    for (let i = 0; i < history.length; i++) {
      const move = history[i];
      
      // Get position before move
      const fenBefore = chess.fen();
      
      // Get best move for this position
      const bestMove = await stockfish.getBestMove(fenBefore, 15);
      const evaluation = await stockfish.evaluatePosition(fenBefore, 15);
      
      // Make the move
      chess.move(move.san);
      
      // Get position after move
      const fenAfter = chess.fen();
      const evalAfter = await stockfish.evaluatePosition(fenAfter, 15);
      
      // Calculate evaluation drop (from player's perspective)
      const evalDrop = move.color === 'w' 
        ? (previousEval - evalAfter) 
        : (evalAfter - previousEval);
      
      // Classify move
      let classification: MoveAnalysis['classification'] = 'good';
      
      if (evalDrop <= 0) {
        if (evalDrop <= -0.5) classification = 'brilliant';
        else if (evalDrop <= -0.2) classification = 'great';
        else classification = 'good';
      } else {
        if (evalDrop >= 3) classification = 'blunder';
        else if (evalDrop >= 1.5) classification = 'mistake';
        else if (evalDrop >= 0.5) classification = 'inaccuracy';
        else classification = 'good';
      }
      
      moveAnalyses.push({
        moveNumber: Math.floor(i / 2) + 1,
        move: move.san,
        fen: fenAfter,
        evaluation: evalAfter,
        bestMove: bestMove,
        classification,
        evaluationDrop: evalDrop,
      });
      
      previousEval = evalAfter;
      
      // Report progress
      if (onProgress) {
        onProgress(Math.round(((i + 1) / history.length) * 100));
      }
    }
    
    // Calculate accuracy
    const whiteMoves = moveAnalyses.filter((_, i) => i % 2 === 0);
    const blackMoves = moveAnalyses.filter((_, i) => i % 2 === 1);
    
    const calculateAccuracy = (moves: MoveAnalysis[]) => {
      if (moves.length === 0) return 100;
      
      const goodMoves = moves.filter(m => 
        ['brilliant', 'great', 'good'].includes(m.classification)
      ).length;
      
      return Math.round((goodMoves / moves.length) * 100);
    };
    
    // Calculate summary
    const summary = {
      brilliantMoves: moveAnalyses.filter(m => m.classification === 'brilliant').length,
      greatMoves: moveAnalyses.filter(m => m.classification === 'great').length,
      goodMoves: moveAnalyses.filter(m => m.classification === 'good').length,
      inaccuracies: moveAnalyses.filter(m => m.classification === 'inaccuracy').length,
      mistakes: moveAnalyses.filter(m => m.classification === 'mistake').length,
      blunders: moveAnalyses.filter(m => m.classification === 'blunder').length,
    };
    
    return {
      moves: moveAnalyses,
      accuracy: {
        white: calculateAccuracy(whiteMoves),
        black: calculateAccuracy(blackMoves),
      },
      summary,
      averageEvaluation: moveAnalyses.reduce((sum, m) => sum + m.evaluation, 0) / moveAnalyses.length,
    };
  }
}

export const gameAnalysisService = new GameAnalysisService();
