import AuthShell from '../components/auth/AuthShell.jsx';
import VerificationForm from '../forms/auth/VerificationForm.jsx';

export default function Verification() {
  return <AuthShell mode="register"><VerificationForm /></AuthShell>;
}
