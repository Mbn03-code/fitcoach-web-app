import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi.js';
import { humanError } from '../../api/errorMessages.js';
import { useAuth } from '../../context/AuthContext.jsx';
import AuthInput from '../../components/auth/AuthInput.jsx';
import PrimaryButton from '../../components/ui/PrimaryButton.jsx';
import { requestCodeSchema, verifyCodeSchema } from '../../validation/auth/authSchemas.js';

export default function LoginCodeForm({ switchToPassword }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('phone');
  const [devOtp, setDevOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function requestCode(event) {
    event.preventDefault();
    setError('');
    const validation = requestCodeSchema.safeParse({ phone });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const result = await authApi.requestLoginCode({ phone: phone.trim() });
      setDevOtp(result.dev_otp || '');
      setStep('code');
    } catch (err) {
      setError(humanError(err));
    } finally {
      setLoading(false);
    }
  }

  async function submitCode(event) {
    event.preventDefault();
    setError('');
    const validation = verifyCodeSchema.safeParse({ code });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const result = await authApi.loginCode({ phone: phone.trim(), code });
      login(result.access_token, result.user);
      navigate('/dashboard');
    } catch (err) {
      setError(humanError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-card auth-card--login" onSubmit={step === 'phone' ? requestCode : submitCode} noValidate>
      <div className="auth-card__brand auth-card__brand--mobile">Futurea</div>
      <h1>Log in</h1>
      <p className="auth-subtitle">Use your Iranian phone number and one-time code.</p>
      {step === 'phone' ? (
        <AuthInput icon="phone" placeholder="Phone number, like 09123456789" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" />
      ) : (
        <>
          <AuthInput icon="phone" placeholder="Verification code" value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" />
          {devOtp && <div className="dev-otp">Dev OTP: <strong>{devOtp}</strong></div>}
        </>
      )}
      {error && <div className="server-error">{error}</div>}
      <PrimaryButton type="submit" loading={loading}>{step === 'phone' ? 'Get Code' : 'Verify Code'}</PrimaryButton>
      <button type="button" className="code-link" onClick={switchToPassword}>Login with password</button>
      <p className="auth-footer-text">Don’t have an account? <Link to="/register">Sign up</Link></p>
    </form>
  );
}
