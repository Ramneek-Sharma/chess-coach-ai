import Groq from 'groq-sdk';
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
- Analyze the CURRENT position shown in the FEN, not the starting position
- Give advice from ${request.playerColor || 'white'}'s perspective
- Look at where the pieces actually are right now
- Focus on what ${request.playerColor || 'white'} should do next

Provide a brief analysis (2-3 sentences) covering:
1. What is happening in THIS specific position for ${request.playerColor || 'white'}
2. Key threats or opportunities for ${request.playerColor || 'white'} RIGHT NOW
3. What ${request.playerColor || 'white'} should consider for their NEXT move

Keep it concise and relevant to the actual current position.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert chess coach. Always analyze the CURRENT position based on the FEN provided. Give advice from the player's color perspective (${request.playerColor || 'white'}).`,
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
  const systemPrompt = `You are an experienced chess coach helping a student who is playing as ${color.toUpperCase()}.

${currentFen ? `CURRENT POSITION (FEN): ${currentFen}` : ''}
${moveHistory ? `MOVES PLAYED: ${moveHistory}` : ''}

CRITICAL INSTRUCTIONS:
- You are coaching the ${color.toUpperCase()} player
- Analyze the CURRENT position shown in the FEN, not the starting position
- Base your advice on where the pieces ACTUALLY are right now from ${color}'s perspective
- Don't suggest moves that have already been played
- Look at the actual board state before giving advice
- Focus on what is good or bad for ${color}
- When it's ${color}'s turn, suggest good moves
- When it's the opponent's turn, explain what threats to watch for

Be encouraging, educational, and provide specific advice for THIS position from ${color}'s point of view.`;

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

    return completion.choices[0]?.message?.content || 'I apologize, I could not generate a response.';
  } catch (error) {
    console.error('Groq API error:', error);
    throw new Error('Failed to chat with coach');
  }
};
