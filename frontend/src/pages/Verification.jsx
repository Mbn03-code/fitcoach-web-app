import VerificationForm from '../forms/auth/VerificationForm.jsx';

export default function Verification() {
  return (
    <main className="auth-page auth-clean-page">
      <section className="auth-card-wrap auth-card-wrap--centered">
        <VerificationForm />
      </section>
    </main>
  );
}
