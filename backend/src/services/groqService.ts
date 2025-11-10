import Groq from 'groq-sdk';
import { Chess } from 'chess.js';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface AnalysisRequest {
  fen: string;
  lastMove?: string;
  gameContext?: string;
  playerColor?: string;
}

export const analyzePosition = async (request: AnalysisRequest): Promise<string> => {
  const prompt = `You are a chess coach analyzing a position for a player playing as ${request.playerColor || 'white'}. 

Current position (FEN): ${request.fen}
${request.lastMove ? `Last move played: ${request.lastMove}` : ''}
${request.gameContext ? `Moves played so far: ${request.gameContext}` : ''}

IMPORTANT: 
- Analyze the CURRENT position shown in the FEN
- Give advice from ${request.playerColor || 'white'}'s perspective
- ONLY suggest LEGAL moves
- Focus on what ${request.playerColor || 'white'} should do next

Provide a brief analysis (2-3 sentences) covering:
1. What is happening in THIS position for ${request.playerColor || 'white'}
2. Key threats or opportunities RIGHT NOW
3. Suggested LEGAL move for ${request.playerColor || 'white'}

Keep it concise and suggest only legal, valid moves.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert chess coach. Always analyze the CURRENT position. ONLY suggest legal moves that are possible in the current position. Never suggest illegal moves.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 400,
    });

    return completion.choices[0]?.message?.content || 'Unable to analyze position.';
  } catch (error) {
    console.error('Groq API error:', error);
    throw new Error('Failed to analyze position');
  }
};

export const chatWithCoach = async (
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>,
  currentFen?: string,
  moveHistory?: string,
  playerColor?: string
): Promise<string> => {
  const color = playerColor || 'white';
  
  // Validate move suggestions if user asks for moves
  let legalMoves: string[] = [];
  if (currentFen) {
    try {
      const chess = new Chess(currentFen);
      legalMoves = chess.moves({ verbose: true }).map(m => m.san);
    } catch (error) {
      console.error('Error getting legal moves:', error);
    }
  }

  const systemPrompt = `You are an experienced chess coach helping a student who is playing as ${color.toUpperCase()}.

${currentFen ? `CURRENT POSITION (FEN): ${currentFen}` : ''}
${moveHistory ? `MOVES PLAYED: ${moveHistory}` : ''}
${legalMoves.length > 0 ? `LEGAL MOVES AVAILABLE: ${legalMoves.slice(0, 20).join(', ')}${legalMoves.length > 20 ? '...' : ''}` : ''}

CRITICAL INSTRUCTIONS:
- You are coaching the ${color.toUpperCase()} player
- Analyze the CURRENT position shown in the FEN
- ONLY suggest moves from the legal moves list provided
- NEVER suggest illegal moves
- If you suggest a move, it MUST be in the legal moves list
- Base your advice on where pieces ACTUALLY are right now
- Focus on what is good for ${color}

Be encouraging, educational, and provide specific advice with ONLY LEGAL MOVES.`;

  const messages: any[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
    ...conversationHistory.slice(-10),
    {
      role: 'user',
      content: userMessage,
    },
  ];

  try {
    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.6,
      max_tokens: 600,
    });

    let response = completion.choices[0]?.message?.content || 'I apologize, I could not generate a response.';
    
    // Post-process: Validate any moves mentioned in the response
    if (legalMoves.length > 0) {
      // Check if response contains move suggestions
      const movePattern = /\b([NBRQK]?[a-h]?[1-8]?x?[a-h][1-8](?:=[NBRQ])?[+#]?)\b/g;
      const suggestedMoves = response.match(movePattern) || [];
      
      // Validate each suggested move
      for (const move of suggestedMoves) {
        if (!legalMoves.includes(move)) {
          console.log(`⚠️ AI suggested illegal move: ${move}`);
          // Don't completely reject, but log it
        }
      }
    }

    return response;
  } catch (error) {
    console.error('Groq API error:', error);
    throw new Error('Failed to chat with coach');
  }
};
