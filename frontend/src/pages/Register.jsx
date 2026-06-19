import AuthShell from '../components/auth/AuthShell.jsx';
import RegisterForm from '../forms/auth/RegisterForm.jsx';

export default function Register() {
  return <AuthShell mode="register"><RegisterForm /></AuthShell>;
}
