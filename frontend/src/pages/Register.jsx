import { Navigate } from 'react-router-dom';
import RegisterForm from '../forms/auth/RegisterForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <main className="auth-page auth-clean-page">
      <section className="auth-card-wrap auth-card-wrap--centered">
        <RegisterForm />
      </section>
    </main>
  );
}
