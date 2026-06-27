import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, CalendarCheck, ClipboardList, RotateCw, Send, Star } from 'lucide-react';
import Logo from '../components/ui/Logo.jsx';
import { coachApi } from '../api/coachApi.js';
import { coachRequestApi } from '../api/coachRequestApi.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function CoachDetail() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [coach, setCoach] = useState(null);
  const [message, setMessage] = useState('Hi coach, I want a workout program based on my current fitness profile.');
  const [requestResult, setRequestResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setCoach(await coachApi.detail(id));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function requestProgram() {
    if (!isAuthenticated) return;
    setRequestLoading(true);
    setError('');
    try {
      const result = await coachRequestApi.create({ coach_id: Number(id), message });
      setRequestResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setRequestLoading(false);
    }
  }

  if (isAuthenticated && user?.role === 'coach' && Number(id) === user.id) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="program-page coaches-page">
      <section className="program-shell narrow">
        <div className="program-header">
          <Logo />
          <div className="program-header__actions">
            <Link to="/coaches"><ArrowLeft size={16} /> Coaches</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
        </div>

        {loading && <div className="program-state"><RotateCw className="spin" /> Loading coach...</div>}
        {error && <div className="server-error">{error}</div>}
        {coach && (
          <>
            <div className="coach-detail-hero no-image left-aligned">
              <div>
                <span className="section-kicker">Coach profile</span>
                <h1>{coach.full_name}</h1>
                <p><BadgeCheck size={18} /> {coach.specialty}</p>
                <div className="coach-tags">
                  {coach.tags.map((tag) => <small key={tag}>{tag}</small>)}
                </div>
              </div>
              <div className="coach-rating-box"><Star /> <b>{coach.rating.toFixed(1)}</b><span>Average rating</span></div>
            </div>

            <div className="program-two-column coach-detail-grid">
              <section className="program-list-panel left-aligned">
                <span className="section-kicker">About</span>
                <h2>Coaching approach</h2>
                <p>{coach.approach}</p>
                <div className="info-grid coach-mini-info">
                  <span><b>Phone</b>{coach.phone}</span>
                  <span><b>Experience</b>{coach.experience_years} years</span>
                  <span><b>Programs written</b>{coach.programs_count}</span>
                </div>
              </section>
              <section className="program-list-panel left-aligned">
                <span className="section-kicker">Choose coach</span>
                <h2>Select this coach for your plan</h2>
                {!isAuthenticated && <p>Please log in as an athlete before requesting a program.</p>}
                {isAuthenticated && user?.role !== 'athlete' && <p>Only athletes can request programs from coaches.</p>}
                {isAuthenticated && user?.role === 'athlete' && (
                  <div className="request-form-box">
                    <label>
                      Message to coach
                      <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
                    </label>
                    <button className="program-cta coach-cta" type="button" disabled={requestLoading} onClick={requestProgram}>
                      <Send size={18} /> {requestLoading ? 'Sending...' : 'Choose this Coach'}
                    </button>
                  </div>
                )}
                {requestResult && (
                  <div className="request-success-box">
                    <b>Request sent!</b>
                    <span>Status: {requestResult.status}</span>
                    <Link to="/programs">Back to Programs</Link>
                  </div>
                )}
              </section>
            </div>

            <section className="program-list-panel left-aligned coach-sample-section">
              <span className="section-kicker">Sample plan</span>
              <h2>What you can expect</h2>
              <div className="coach-plan-list">
                {coach.sample_plan.map((item) => <div key={item}><CalendarCheck size={18} /> {item}</div>)}
              </div>
              <Link className="program-cta coach-cta" to="/coaches"><ClipboardList size={18} /> Back to Coaches</Link>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
