CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rating INTEGER DEFAULT 1200,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  pgn TEXT NOT NULL,
  fen VARCHAR(255),
  source VARCHAR(50) NOT NULL DEFAULT 'platform',
  result VARCHAR(20),
  user_color VARCHAR(10),
  opponent VARCHAR(100),
  opponent_rating INTEGER,
  played_at TIMESTAMP DEFAULT NOW(),
  analyzed BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS game_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  move_number INTEGER NOT NULL,
  move_notation VARCHAR(20) NOT NULL,
  fen VARCHAR(255) NOT NULL,
  evaluation DECIMAL(5,2),
  best_move VARCHAR(20),
  move_classification VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  position_fen VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_games_user_id ON games(user_id);
CREATE INDEX IF NOT EXISTS idx_games_played_at ON games(played_at);
CREATE INDEX IF NOT EXISTS idx_analysis_game_id ON game_analysis(game_id);
CREATE INDEX IF NOT EXISTS idx_chat_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_game_id ON chat_messages(game_id);
