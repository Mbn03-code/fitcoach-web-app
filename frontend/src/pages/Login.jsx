import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import LoginPasswordForm from '../forms/auth/LoginPasswordForm.jsx';
import LoginCodeForm from '../forms/auth/LoginCodeForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState('password');

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <main className="auth-page auth-clean-page">
      <section className="auth-card-wrap auth-card-wrap--centered">
        {mode === 'password' ? (
          <LoginPasswordForm switchToCode={() => setMode('code')} />
        ) : (
          <LoginCodeForm switchToPassword={() => setMode('password')} />
        )}
      </section>
    </main>
  );
}
