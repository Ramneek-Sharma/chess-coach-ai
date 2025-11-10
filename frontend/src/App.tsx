import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthPage } from './pages/AuthPage';
import { GamePage } from './pages/GamePage';
import { ComputerGamePage } from './pages/ComputerGamePage';
import { HistoryPage } from './pages/HistoryPage';
import { ReplayPage } from './pages/ReplayPage';
import { useAuthStore } from './store/authStore';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" />;
};

function App() {
  const { loadUserFromToken } = useAuthStore();

  useEffect(() => {
    loadUserFromToken();
  }, [loadUserFromToken]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/game"
          element={
            <ProtectedRoute>
              <GamePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/computer"
          element={
            <ProtectedRoute>
              <ComputerGamePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/replay/:gameId"
          element={
            <ProtectedRoute>
              <ReplayPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/game" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
