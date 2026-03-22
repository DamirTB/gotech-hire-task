import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ChatPage from './components/ChatPage';
import { API_URL } from './config';

export default function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token'),
  );
  const [userId, setUserId] = useState<number | null>(
    localStorage.getItem('userId')
      ? parseInt(localStorage.getItem('userId')!)
      : null,
  );

  const handleLogin = (newToken: string, newUserId: number) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', String(newUserId));
    setToken(newToken);
    setUserId(newUserId);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setToken(null);
    setUserId(null);
  };

  const isAuthenticated = Boolean(token && userId);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/chat" />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/chat" />
            ) : (
              <RegisterPage onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/chat"
          element={
            token && userId ? (
              <ChatPage
                token={token}
                userId={userId}
                apiUrl={API_URL}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/chat' : '/login'} />}
        />
      </Routes>
    </BrowserRouter>
  );
}
