import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi.js';
import { humanError } from '../../api/errorMessages.js';
import { useAuth } from '../../context/AuthContext.jsx';
import AuthInput from '../../components/auth/AuthInput.jsx';
import PrimaryButton from '../../components/ui/PrimaryButton.jsx';
import { verifyCodeSchema } from '../../validation/auth/authSchemas.js';

export default function VerificationForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPhone(sessionStorage.getItem('pending_phone') || '');
    setDevOtp(sessionStorage.getItem('pending_dev_otp') || '');
  }, []);

  async function submit(event) {
    event.preventDefault();
    setError('');
    const validation = verifyCodeSchema.safeParse({ code });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const result = await authApi.verifySignup({ phone, code });
      login(result.access_token, result.user);
      sessionStorage.removeItem('pending_phone');
      sessionStorage.removeItem('pending_dev_otp');
      navigate('/dashboard');
    } catch (err) {
      setError(humanError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-card auth-card--login" onSubmit={submit}>
      <div className="auth-card__brand auth-card__brand--mobile">Futurea</div>
      <h1>Verify Code</h1>
      <p className="auth-subtitle">Enter the code sent to {phone || 'your phone'}.</p>
      <AuthInput icon="phone" placeholder="6 digit code" value={code} onChange={(e) => setCode(e.target.value)} />
      {devOtp && <div className="dev-otp">Dev OTP: <strong>{devOtp}</strong></div>}
      {error && <div className="server-error">{error}</div>}
      <PrimaryButton type="submit" loading={loading}>Verify</PrimaryButton>
      <button className="code-link" type="button" onClick={() => navigate('/register')}>Back to sign up</button>
    </form>
  );
}
