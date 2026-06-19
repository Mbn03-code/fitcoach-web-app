import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/ui/Logo.jsx';
import { dashboardApi } from '../api/dashboardApi.js';

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    async function loadDashboard() {
      try {
        const data = await dashboardApi.me();
        setDashboard(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const profile = dashboard?.profile;
  const activeUser = profile?.user || user;

  return (
    <main className="dashboard-page">
      <section className="dashboard-card">
        <Logo />
        <h1>Welcome, {activeUser?.full_name}</h1>
        {loading && <p>Loading dashboard...</p>}
        {error && <div className="server-error">{error}</div>}
        {!loading && dashboard && (
          <>
            <p>{dashboard.message}</p>
            <p className="dashboard-next">Next step: {dashboard.next_step}</p>
            <div className="dashboard-info dashboard-stats">
              {dashboard.stats.map((stat) => (
                <span key={stat.label}><b>{stat.value}</b>{stat.label}</span>
              ))}
            </div>
          </>
        )}
        <div className="dashboard-info">
          <span>Phone: {activeUser?.phone}</span>
          <span>Role: {activeUser?.role}</span>
          <span>Verified: {activeUser?.is_verified ? 'Yes' : 'No'}</span>
        </div>
        <div className="dashboard-actions">
          <Link to="/profile">Complete profile</Link>
          <Link to="/">Landing</Link>
          <button onClick={logout}>Logout</button>
        </div>
      </section>
    </main>
  );
}
