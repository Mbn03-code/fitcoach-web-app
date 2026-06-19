import { useState } from 'react';
import AuthShell from '../components/auth/AuthShell.jsx';
import LoginPasswordForm from '../forms/auth/LoginPasswordForm.jsx';
import LoginCodeForm from '../forms/auth/LoginCodeForm.jsx';

export default function Login() {
  const [mode, setMode] = useState('password');
  return (
    <AuthShell mode="login">
      {mode === 'password' ? (
        <LoginPasswordForm switchToCode={() => setMode('code')} />
      ) : (
        <LoginCodeForm switchToPassword={() => setMode('password')} />
      )}
    </AuthShell>
  );
}
