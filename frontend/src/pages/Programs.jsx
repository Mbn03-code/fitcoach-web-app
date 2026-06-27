import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { CalendarDays, Dumbbell, Plus, RotateCw } from 'lucide-react';
import Logo from '../components/ui/Logo.jsx';
import { programApi } from '../api/programApi.js';
import { coachRequestApi } from '../api/coachRequestApi.js';
import { useAuth } from '../context/AuthContext.jsx';

function progressPercent(item) {
  if (!item.total_weeks) return 0;
  return Math.round((item.completed_weeks / item.total_weeks) * 100);
}

export default function Programs() {
  const { isAuthenticated, user, logout } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    async function load() {
      try {
        const data = await programApi.list();
        setPrograms(data);
        if (user?.role === 'athlete') {
          setRequests(await coachRequestApi.my());
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isAuthenticated, user?.role]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const isCoach = user?.role === 'coach' || user?.role === 'admin';

  return (
    <main className="program-page">
      <section className="program-shell">
        <div className="program-header">
          <Logo />
          <div className="program-header__actions">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/exercises">Exercises</Link>
            <button type="button" onClick={logout}>Logout</button>
          </div>
        </div>

        <div className="program-hero-card">
          <div>
            <span className="section-kicker">Programs</span>
            <h1>{isCoach ? 'Manage written programs' : 'Your workout programs'}</h1>
            <p>
              Coaches can create real training plans with exercises, days, sets and reps.
              Athletes can open a program and mark each week as completed.
            </p>
          </div>
          {isCoach && <Link className="program-cta" to="/programs/new"><Plus size={20} /> Make Program</Link>}
        </div>

        {loading && <div className="program-state"><RotateCw className="spin" /> Loading programs...</div>}
        {error && <div className="server-error">{error}</div>}
        {!loading && !error && programs.length === 0 && (
          <div className="program-empty">
            <Dumbbell size={42} />
            <h2>No programs yet</h2>
            <p>{isCoach ? 'Accept an athlete request, then create your first workout plan.' : 'A coach has not sent a program to you yet. Choose a coach to request one.'}</p>
            {!isCoach && requests.length > 0 && (
              <div className="request-inline-list">
                {requests.map((request) => (
                  <span key={request.id} className={`request-status ${request.status}`}>{request.coach.full_name}: {request.status.replace('_', ' ')}</span>
                ))}
              </div>
            )}
            {isCoach ? <Link to="/programs/new">Make Program</Link> : <Link to="/coaches">Find Coaches</Link>}
          </div>
        )}

        <div className="program-grid">
          {programs.map((item) => (
            <Link className="program-card" to={`/programs/${item.id}`} key={item.id}>
              <div className="program-card__top">
                <span><CalendarDays size={18} /> {item.duration_weeks} weeks</span>
                <span>{item.days_per_week} days/week</span>
              </div>
              <h2>{item.title}</h2>
              <p>{item.description || 'No description added.'}</p>
              <div className="program-people">
                <span>Coach: {item.coach.full_name}</span>
                <span>Athlete: {item.athlete.full_name}</span>
              </div>
              <div className="program-progress">
                <div><b>{item.completed_weeks}</b> / {item.total_weeks} weeks completed</div>
                <div className="progress-track"><i style={{ width: `${progressPercent(item)}%` }} /></div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
