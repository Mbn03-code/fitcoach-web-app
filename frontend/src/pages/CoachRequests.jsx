import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, ClipboardList, RotateCw, UserRoundCheck } from 'lucide-react';
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

function AthleteProfileBlock({ request }) {
  const profile = request.athlete_profile || {};
  return (
    <div className="info-grid request-profile-grid">
      <span><b>Athlete</b>{request.athlete.full_name}</span>
      <span><b>Phone</b>{request.athlete.phone}</span>
      <span><b>Goal</b>{profile.goal || 'Not completed yet'}</span>
      <span><b>Level</b>{profile.level || 'Not completed yet'}</span>
      <span><b>Height</b>{profile.height_cm ? `${profile.height_cm} cm` : 'Not set'}</span>
      <span><b>Weight</b>{profile.weight_kg ? `${profile.weight_kg} kg` : 'Not set'}</span>
      <span><b>Available days</b>{profile.available_days_per_week || 'Not set'}</span>
    </div>
  );
}

export default function CoachRequests() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      setError('');
      const data = await coachRequestApi.incoming();
      setRequests(data);
      if (!selected && data.length) setSelected(data[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated || !['coach', 'admin'].includes(user?.role)) return;
    load();
  }, [isAuthenticated, user?.role]);

  async function selectRequest(request) {
    try {
      setError('');
      setSelected(await coachRequestApi.detail(request.id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateStatus(status) {
    if (!selected) return;
    setActionLoading(true);
    try {
      const updated = await coachRequestApi.updateStatus(selected.id, status);
      setSelected(updated);
      setRequests((prev) => prev.map((item) => item.id === updated.id ? updated : item));
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!['coach', 'admin'].includes(user?.role)) return <Navigate to="/dashboard" replace />;

  return (
    <main className="program-page request-page">
      <section className="program-shell">
        <div className="program-header">
          <Logo />
          <div className="program-header__actions">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/programs">Written Programs</Link>
            <Link to="/programs/new">Make Program</Link>
          </div>
        </div>

        <div className="program-hero-card compact request-hero">
          <div>
            <span className="section-kicker">Program Requests</span>
            <h1>Athletes waiting for your plan</h1>
            <p>Review each athlete, accept the request, then create and send a workout program from the request.</p>
          </div>
          <UserRoundCheck size={58} />
        </div>

        {loading && <div className="program-state"><RotateCw className="spin" /> Loading requests...</div>}
        {error && <div className="server-error">{error}</div>}
        {!loading && !error && !requests.length && (
          <div className="program-empty"><ClipboardList size={42} /><h2>No requests yet</h2><p>Requests from athletes will appear here.</p></div>
        )}

        {!!requests.length && (
          <div className="program-two-column request-workspace">
            <section className="program-list-panel request-list-panel">
              <span className="section-kicker">Inbox</span>
              <h2>Incoming requests</h2>
              <div className="request-list">
                {requests.map((request) => (
                  <button key={request.id} type="button" className={`request-list-item ${selected?.id === request.id ? 'active' : ''}`} onClick={() => selectRequest(request)}>
                    <div>
                      <strong>{request.athlete.full_name}</strong>
                      <small>{request.message || 'No message added.'}</small>
                    </div>
                    <span className={`request-status ${request.status}`}>{statusLabel(request.status)}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="program-list-panel request-detail-panel">
              {selected ? (
                <>
                  <span className="section-kicker">Selected request</span>
                  <h2>{selected.athlete.full_name}</h2>
                  <p>{selected.message || 'This athlete did not add a message.'}</p>
                  <AthleteProfileBlock request={selected} />
                  <div className="request-actions-row">
                    {selected.status === 'pending' && (
                      <>
                        <button type="button" className="program-cta request-action" disabled={actionLoading} onClick={() => updateStatus('accepted')}>Accept Request</button>
                        <button type="button" className="danger-button request-action" disabled={actionLoading} onClick={() => updateStatus('rejected')}>Reject</button>
                      </>
                    )}
                    {selected.status === 'accepted' && (
                      <button type="button" className="program-cta request-action" onClick={() => navigate(`/programs/new?requestId=${selected.id}`)}>Create Program <ArrowRight size={16} /></button>
                    )}
                    {selected.status === 'program_sent' && selected.program && (
                      <Link className="program-cta request-action" to={`/programs/${selected.program.id}`}>Open Sent Program <ArrowRight size={16} /></Link>
                    )}
                    {selected.status === 'rejected' && <p className="request-note">This request was rejected.</p>}
                  </div>
                </>
              ) : <p>Select a request.</p>}
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
