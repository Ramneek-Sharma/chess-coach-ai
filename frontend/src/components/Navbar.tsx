import { useAuthStore } from '../store/authStore';
import { useNavigate, useLocation } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="bg-gradient-to-r from-white to-gray-50 shadow-lg mb-8 border-b-2 border-gray-200">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <h1 
            onClick={() => navigate('/game')}
            className="text-3xl font-extrabold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-transform"
          >
            ♟️ Chess Coach AI
          </h1>
          
          <div className="flex space-x-2">
            <button
              onClick={() => navigate('/game')}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                location.pathname === '/game'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🎮 Play
            </button>
            <button
              onClick={() => navigate('/history')}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                location.pathname === '/history'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📚 History
            </button>
          </div>
          
          {user && (
            <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-2 rounded-xl border border-gray-200">
              <span className="text-sm font-bold text-gray-700">{user.username}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 px-5 py-2 rounded-xl border border-green-200">
                <span className="text-sm font-semibold text-gray-600">Rating:</span>{' '}
                <span className="font-bold text-xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  {user.rating}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-md font-semibold"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
