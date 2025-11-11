import { useState, useRef, useEffect } from 'react';
import { coachAPI } from '../services/coachAPI';
import { useGameStore } from '../store/gameStore';
import { useComputerGameStore } from '../store/computerGameStore';
import { useLocation } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AICoachChat = () => {
  const location = useLocation();
  const isComputerGame = location.pathname === '/computer';
  
  const practiceGameState = useGameStore((state) => state.gameState);
  const computerGameState = useComputerGameStore((state) => state.gameState);
  
  const gameState = isComputerGame ? computerGameState : practiceGameState;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMoveCountRef = useRef(0);

  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: `Hello! I'm your chess coach analyzing from ${playerColor}'s perspective.`,
    }]);
  }, [playerColor]);

  useEffect(() => {
    if (gameState.moves.length === 0 && lastMoveCountRef.current > 0) {
      setMessages([{
        role: 'assistant',
        content: `New game! Playing as ${playerColor}. Good luck!`,
      }]);
    }
    lastMoveCountRef.current = gameState.moves.length;
  }, [gameState.moves.length, playerColor]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages([...messages, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await coachAPI.chat({
        message: userMessage,
        conversationHistory: messages,
        currentFen: gameState.fen,
        moveHistory: gameState.moves.map(m => m.san).join(' '),
        playerColor: playerColor,
      });

      setMessages((prev) => [...prev, { role: 'assistant', content: response.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3 h-56">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <span className="text-base mr-2">🤖</span>
          <h3 className="text-sm font-bold text-gray-800">AI Coach</h3>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setPlayerColor('white')}
            className={`px-2 py-0.5 text-xs rounded ${playerColor === 'white' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}
          >
            ⚪
          </button>
          <button
            onClick={() => setPlayerColor('black')}
            className={`px-2 py-0.5 text-xs rounded ${playerColor === 'black' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}
          >
            ⚫
          </button>
        </div>
      </div>

      <div className="h-32 overflow-y-auto mb-2 space-y-1.5 text-xs">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-2 py-1 rounded-lg ${
              msg.role === 'user' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-800'
            }`}>
              <p className="text-xs leading-tight">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-blue-100 px-2 py-1 rounded-lg">
              <p className="text-xs text-blue-700">Thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-1.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask coach..."
          className="flex-1 px-2 py-1 border rounded-lg text-xs focus:ring-1 focus:ring-green-500"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 disabled:bg-gray-300"
        >
          Send
        </button>
      </div>
    </div>
  );
};
