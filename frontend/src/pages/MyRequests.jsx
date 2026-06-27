import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, ClipboardList, RotateCw, Send } from 'lucide-react';
import Logo from '../components/ui/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { coachRequestApi } from '../api/coachRequestApi.js';

function statusLabel(status) {
  const labels = {
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
    program_sent: 'Program Sent',
  };
  return labels[status] || status;
}

export default function MyRequests() {
  const { isAuthenticated, user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'athlete') return;
    async function load() {
      try {
        setRequests(await coachRequestApi.my());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isAuthenticated, user?.role]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'athlete') return <Navigate to="/dashboard" replace />;

  return (
    <main className="program-page request-page">
      <section className="program-shell">
        <div className="program-header">
          <Logo />
          <div className="program-header__actions">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/coaches">Find Coaches</Link>
            <Link to="/programs">Programs</Link>
          </div>
        </div>

        <div className="program-hero-card compact request-hero">
          <div>
            <span className="section-kicker">My Requests</span>
            <h1>Track your coach requests</h1>
            <p>When you ask a coach for a program, the request appears here. Once the coach sends the plan, you can open it from Programs.</p>
          </div>
          <Send size={58} />
        </div>

        {loading && <div className="program-state"><RotateCw className="spin" /> Loading requests...</div>}
        {error && <div className="server-error">{error}</div>}
        {!loading && !error && !requests.length && (
          <div className="program-empty">
            <ClipboardList size={42} />
            <h2>No requests yet</h2>
            <p>Open a coach profile and request a workout program.</p>
            <Link to="/coaches">Find Coaches</Link>
          </div>
        )}

        <div className="request-grid">
          {requests.map((request) => (
            <article className="request-card" key={request.id}>
              <div className="request-card__top">
                <span className={`request-status ${request.status}`}>{statusLabel(request.status)}</span>
                <small>Request #{request.id}</small>
              </div>
              <h2>{request.coach.full_name}</h2>
              <p>{request.message || 'No message added.'}</p>
              {request.program ? (
                <Link className="program-cta small" to={`/programs/${request.program.id}`}>Open Program <ArrowRight size={16} /></Link>
              ) : (
                <Link className="request-secondary-link" to={`/coaches/${request.coach.id}`}>Open coach profile</Link>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
