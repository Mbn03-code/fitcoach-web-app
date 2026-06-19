import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi.js';
import { humanError } from '../../api/errorMessages.js';
import AuthInput from '../../components/auth/AuthInput.jsx';
import PrimaryButton from '../../components/ui/PrimaryButton.jsx';
import { registerSchema } from '../../validation/auth/authSchemas.js';

function getFieldErrors(result) {
  if (result.success) return {};
  return Object.fromEntries(result.error.issues.map((issue) => [issue.path[0], issue.message]));
}

export default function RegisterForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', phone: '', role: 'athlete', password: '', confirm_password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setServerError('');
    const validation = registerSchema.safeParse(form);
    setErrors(getFieldErrors(validation));
    if (!validation.success) return;

    setLoading(true);
    try {
      const payload = {
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        role: form.role,
        password: form.password,
      };
      const result = await authApi.register(payload);
      sessionStorage.setItem('pending_phone', result.phone || form.phone);
      sessionStorage.setItem('pending_dev_otp', result.dev_otp || '');
      navigate('/verify?purpose=signup');
    } catch (error) {
      setServerError(humanError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-card" onSubmit={submit} noValidate>
      <div className="auth-card__brand auth-card__brand--mobile">Futurea</div>
      <h1>Sign up</h1>
      <p className="auth-subtitle">Create your account with your phone number and start your fitness plan.</p>

      <AuthInput icon="user" placeholder="Full name" value={form.full_name} onChange={update('full_name')} error={errors.full_name} autoComplete="name" />
      <AuthInput icon="phone" placeholder="Phone number, like 09123456789" value={form.phone} onChange={update('phone')} error={errors.phone} inputMode="numeric" autoComplete="tel" />

      <div className="role-block">
        <span>Choose your role</span>
        <div className="role-selector" aria-label="account type">
          <button type="button" className={form.role === 'athlete' ? 'active' : ''} onClick={() => setForm((p) => ({ ...p, role: 'athlete' }))}>Athlete</button>
          <button type="button" className={form.role === 'coach' ? 'active' : ''} onClick={() => setForm((p) => ({ ...p, role: 'coach' }))}>Coach</button>
        </div>
      </div>

      <AuthInput icon="lock" type="password" placeholder="Password, at least 8 characters" value={form.password} onChange={update('password')} rightIcon error={errors.password} autoComplete="new-password" />
      <AuthInput icon="lock" type="password" placeholder="Confirm password" value={form.confirm_password} onChange={update('confirm_password')} rightIcon error={errors.confirm_password} autoComplete="new-password" />
      {serverError && <div className="server-error">{serverError}</div>}
      <PrimaryButton type="submit" loading={loading}>Get Started</PrimaryButton>
      <div className="otp-note"><ShieldCheck size={18} /> We will show a test verification code for your phone number in the next step.</div>
      <p className="auth-footer-text">Already have an account? <Link to="/login">Login</Link></p>
    </form>
  );
}
