import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi.js';
import { humanError } from '../../api/errorMessages.js';
import { useAuth } from '../../context/AuthContext.jsx';
import AuthDivider from '../../components/auth/AuthDivider.jsx';
import AuthInput from '../../components/auth/AuthInput.jsx';
import PrimaryButton from '../../components/ui/PrimaryButton.jsx';
import { loginPasswordSchema } from '../../validation/auth/authSchemas.js';

export default function LoginPasswordForm({ switchToCode }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setServerError('');
    const validation = loginPasswordSchema.safeParse(form);
    if (!validation.success) {
      setErrors(Object.fromEntries(validation.error.issues.map((issue) => [issue.path[0], issue.message])));
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const result = await authApi.loginPassword({ phone: form.phone.trim(), password: form.password });
      login(result.access_token, result.user);
      navigate('/dashboard');
    } catch (error) {
      setServerError(humanError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-card auth-card--login" onSubmit={submit} noValidate>
      <div className="auth-card__brand auth-card__brand--mobile">Futurea</div>
      <h1>Log in</h1>
      <p className="auth-subtitle">Welcome back! Enter your phone number and password.</p>
      <AuthInput icon="phone" placeholder="Phone number, like 09123456789" value={form.phone} onChange={update('phone')} error={errors.phone} inputMode="numeric" autoComplete="tel" />
      <AuthInput icon="lock" type="password" placeholder="Password" value={form.password} onChange={update('password')} rightIcon error={errors.password} autoComplete="current-password" />
      {serverError && <div className="server-error">{serverError}</div>}
      <PrimaryButton type="submit" loading={loading}>Get Started</PrimaryButton>
      <AuthDivider />
      <button type="button" className="code-link code-link--boxed" onClick={switchToCode}>Login with code</button>
      <p className="auth-footer-text">Don’t have an account? <Link to="/register">Sign up</Link></p>
    </form>
  );
}
