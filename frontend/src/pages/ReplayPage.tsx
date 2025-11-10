import { GameReplay } from '../components/GameReplay';
import { Navbar } from '../components/Navbar';

export const ReplayPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar />
      
      <div className="container mx-auto px-4 max-w-7xl py-8">
        <GameReplay />
      </div>
    </div>
  );
};
