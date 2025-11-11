import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { gameAnalysisService, MoveAnalysis } from '../services/gameAnalysis';
import { Chess } from 'chess.js';

export const AnalysisPage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState<any>(null);
  const [selectedMove, setSelectedMove] = useState<MoveAnalysis | null>(null);

  const startAnalysis = async () => {
    setAnalyzing(true);
    setProgress(0);
    
    try {
      // For now, using dummy PGN - you'd fetch from backend
      const dummyPgn = '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6';
      
      const result = await gameAnalysisService.analyzeGame(dummyPgn, setProgress);
      setAnalysis(result);
      
      if (result.moves.length > 0) {
        setSelectedMove(result.moves[0]);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze game');
    } finally {
      setAnalyzing(false);
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'brilliant': return 'bg-cyan-500 text-white';
      case 'great': return 'bg-green-500 text-white';
      case 'good': return 'bg-blue-400 text-white';
      case 'inaccuracy': return 'bg-yellow-500 text-white';
      case 'mistake': return 'bg-orange-500 text-white';
      case 'blunder': return 'bg-red-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getClassificationIcon = (classification: string) => {
    switch (classification) {
      case 'brilliant': return '!!';
      case 'great': return '!';
      case 'good': return '✓';
      case 'inaccuracy': return '?!';
      case 'mistake': return '?';
      case 'blunder': return '??';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  🔍 Game Analysis
                </h1>
                <p className="text-gray-600">
                  Analyze your game move-by-move with Stockfish
                </p>
              </div>
              
              {!analysis && (
                <button
                  onClick={startAnalysis}
                  disabled={analyzing}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50"
                >
                  {analyzing ? '⏳ Analyzing...' : '🚀 Start Analysis'}
                </button>
              )}
            </div>
            
            {analyzing && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-green-500 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-center mt-2 text-sm text-gray-600">
                  Analyzing... {progress}%
                </p>
              </div>
            )}
          </div>

          {/* Analysis Results */}
          {analysis && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-md p-4">
                  <div className="text-sm text-gray-600 mb-1">White Accuracy</div>
                  <div className="text-3xl font-bold text-green-600">
                    {analysis.accuracy.white}%
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md p-4">
                  <div className="text-sm text-gray-600 mb-1">Black Accuracy</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {analysis.accuracy.black}%
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md p-4">
                  <div className="text-sm text-gray-600 mb-1">Total Moves</div>
                  <div className="text-3xl font-bold text-gray-800">
                    {analysis.moves.length}
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-md p-4">
                  <div className="text-sm text-gray-600 mb-1">Blunders</div>
                  <div className="text-3xl font-bold text-red-600">
                    {analysis.summary.blunders}
                  </div>
                </div>
              </div>

              {/* Move List */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Move-by-Move Analysis</h2>
                
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {analysis.moves.map((moveAnalysis: MoveAnalysis, index: number) => (
                    <div
                      key={index}
                      onClick={() => setSelectedMove(moveAnalysis)}
                      className={`
                        flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all
                        ${selectedMove === moveAnalysis ? 'bg-blue-100 border-2 border-blue-500' : 'hover:bg-gray-50'}
                      `}
                    >
                      <div className="w-12 text-center font-bold text-gray-600">
                        {moveAnalysis.moveNumber}.
                      </div>
                      
                      <div className="flex-1 font-mono font-bold text-lg">
                        {moveAnalysis.move}
                      </div>
                      
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${getClassificationColor(moveAnalysis.classification)}`}>
                        {getClassificationIcon(moveAnalysis.classification)} {moveAnalysis.classification}
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        Eval: {moveAnalysis.evaluation.toFixed(2)}
                      </div>
                      
                      {moveAnalysis.evaluationDrop && moveAnalysis.evaluationDrop > 0.3 && (
                        <div className="text-sm text-red-600 font-semibold">
                          -{moveAnalysis.evaluationDrop.toFixed(2)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Move Details */}
              {selectedMove && (
                <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold mb-3">
                    Move {selectedMove.moveNumber}: {selectedMove.move}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Classification</div>
                      <div className={`inline-block px-4 py-2 rounded-lg font-bold ${getClassificationColor(selectedMove.classification)}`}>
                        {selectedMove.classification.toUpperCase()}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Evaluation</div>
                      <div className="text-2xl font-bold">
                        {selectedMove.evaluation.toFixed(2)}
                      </div>
                    </div>
                    
                    {selectedMove.bestMove && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Best Move</div>
                        <div className="text-xl font-mono font-bold text-green-600">
                          {selectedMove.bestMove}
                        </div>
                      </div>
                    )}
                    
                    {selectedMove.evaluationDrop !== undefined && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Eval Drop</div>
                        <div className={`text-xl font-bold ${selectedMove.evaluationDrop > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {selectedMove.evaluationDrop > 0 ? '-' : '+'}{Math.abs(selectedMove.evaluationDrop).toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => setAnalysis(null)}
                  className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600"
                >
                  Analyze Another Game
                </button>
                
                <button
                  onClick={() => navigate('/history')}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600"
                >
                  Back to History
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
