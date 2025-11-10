import { useState } from 'react';
import { Login } from '../components/auth/Login';
import { Register } from '../components/auth/Register';
import { useNavigate } from 'react-router-dom';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/game');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="text-center mb-8 absolute top-8">
        <h1 className="text-5xl font-bold text-green-600 mb-2">
          ♟️ Chess Coach AI
        </h1>
        <p className="text-gray-600 text-lg">
          Your Personal Chess Training Platform
        </p>
      </div>

      <div className="mt-20">
        {isLogin ? (
          <Login
            onSwitchToRegister={() => setIsLogin(false)}
            onSuccess={handleSuccess}
          />
        ) : (
          <Register
            onSwitchToLogin={() => setIsLogin(true)}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </div>
  );
};
