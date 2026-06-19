import { useState } from 'react';
import { Eye, EyeOff, Lock, Phone, User } from 'lucide-react';

const icons = { user: User, phone: Phone, lock: Lock };

export default function AuthInput({ icon = 'user', rightIcon = false, error, type = 'text', label, ...props }) {
  const Icon = icons[icon] || User;
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && visible ? 'text' : type;

  return (
    <div className="auth-field">
      {label && <span className="auth-field__label">{label}</span>}
      <label className={`auth-input ${error ? 'auth-input--error' : ''}`}>
        <Icon className="auth-input__icon" size={22} />
        <input type={inputType} {...props} />
        {rightIcon && isPassword && (
          <button
            type="button"
            className="auth-input__right auth-eye-button"
            aria-label={visible ? 'Hide password' : 'Show password'}
            onClick={() => setVisible((prev) => !prev)}
          >
            {visible ? <EyeOff size={21} /> : <Eye size={21} />}
          </button>
        )}
      </label>
      {error && <small className="field-error">{error}</small>}
    </div>
  );
}
