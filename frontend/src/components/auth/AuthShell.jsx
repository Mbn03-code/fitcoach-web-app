import Logo from '../ui/Logo.jsx';

export default function AuthShell({ children, mode = 'login' }) {
  const isLogin = mode === 'login';
  return (
    <main className="auth-page">
      <section className="auth-desktop-visual">
        <Logo />
        <div className="auth-athlete-glow" />
        <div className="auth-visual-copy">
          <h1>{isLogin ? 'WELCOME BACK' : 'START STRONG'}</h1>
          <h2>{isLogin ? 'STRONGER THAN YESTERDAY' : 'BUILD YOUR FITNESS STORY'}</h2>
          <p>{isLogin ? 'Log in to continue your fitness journey and unlock your full potential.' : 'Create your account and get a plan that fits your real life.'}</p>
        </div>
      </section>
      <section className="auth-card-wrap">
        {children}
      </section>
    </main>
  );
}
