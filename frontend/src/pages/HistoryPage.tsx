import { GameHistory } from '../components/GameHistory';
import { Navbar } from '../components/Navbar';

export const HistoryPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar />
      
      <div className="container mx-auto px-4 max-w-5xl py-8">
        <GameHistory />
      </div>
    </div>
  );
};
