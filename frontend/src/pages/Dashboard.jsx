import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { Activity, ClipboardList, Dumbbell, Inbox, LogOut, Settings, UserRound, UsersRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/ui/Logo.jsx';
import { dashboardApi } from '../api/dashboardApi.js';
import { profileApi } from '../api/profileApi.js';
import { programApi } from '../api/programApi.js';
import { coachRequestApi } from '../api/coachRequestApi.js';

function progressPercent(item) {
  if (!item?.total_weeks) return 0;
  return Math.round((item.completed_weeks / item.total_weeks) * 100);
}

function DashboardLink({ active, icon: Icon, label, onClick }) {
  return (
    <button type="button" className={`dash-menu-btn ${active ? 'active' : ''}`} onClick={onClick}>
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
}

function ProfileSummary({ profile, user }) {
  const isCoach = user?.role === 'coach';
  const athlete = profile?.athlete_profile;
  const coach = profile?.coach_profile;
  return (
    <section className="dash-panel">
      <div className="dash-panel-title">
        <span className="section-kicker">Profile</span>
        <Link to="/profile">Edit profile</Link>
      </div>
      <h2>Your information</h2>
      <div className="info-grid">
        <span><b>Name</b>{user?.full_name}</span>
        <span><b>Phone</b>{user?.phone}</span>
        <span><b>Role</b>{user?.role}</span>
        <span><b>Status</b>{profile?.is_complete ? 'Complete' : 'Incomplete'}</span>
        {isCoach ? (
          <>
            <span><b>Specialty</b>{coach?.specialty || 'Not set'}</span>
            <span><b>Experience</b>{coach?.experience_years ?? 'Not set'} years</span>
          </>
        ) : (
          <>
            <span><b>Goal</b>{athlete?.goal || 'Not set'}</span>
            <span><b>Level</b>{athlete?.level || 'Not set'}</span>
            <span><b>Available days</b>{athlete?.available_days_per_week || 'Not set'}</span>
          </>
        )}
      </div>
    </section>
  );
}

function ProgramSummary({ programs, user, requests = [] }) {
  const isCoach = user?.role === 'coach' || user?.role === 'admin';
  return (
    <section className="dash-panel">
      <div className="dash-panel-title">
        <span className="section-kicker">Programs</span>
        <Link to="/programs">View all</Link>
      </div>
      <h2>{isCoach ? 'Manage written programs' : 'Your workout programs'}</h2>
      {!programs.length && (
        <div className="dash-empty-state">
          <Dumbbell size={38} />
          <h3>No program yet</h3>
          <p>{isCoach ? 'Accept an athlete request, then create a workout program for that athlete.' : 'Find a coach and request a program. Once the coach sends it, it will appear here.'}</p>
          {isCoach ? <Link to="/coach-requests">Request Athletes</Link> : <Link to="/coaches">Find Coaches</Link>}
        </div>
      )}
      {!isCoach && requests?.length > 0 && (
        <div className="dash-request-list compact">
          {requests.slice(0, 2).map((request) => (
            <Link className="dash-request-card" key={request.id} to={request.program ? `/programs/${request.program.id}` : '/programs'}>
              <div>
                <strong>{request.coach.full_name}</strong>
                <small>{request.message || 'Program request'}</small>
              </div>
              <span className={`request-status ${request.status}`}>{request.status.replace('_', ' ')}</span>
            </Link>
          ))}
        </div>
      )}
      <div className="dash-program-list">
        {programs.slice(0, 4).map((program) => (
          <Link to={`/programs/${program.id}`} className="dash-program-card" key={program.id}>
            <div>
              <strong>{program.title}</strong>
              <small>{isCoach ? `Athlete: ${program.athlete.full_name}` : `Coach: ${program.coach.full_name}`}</small>
            </div>
            <div className="mini-progress"><i style={{ width: `${progressPercent(program)}%` }} /></div>
            <span>{program.completed_weeks}/{program.total_weeks} weeks</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function CoachRequestSummary({ requests }) {
  return (
    <section className="dash-panel">
      <div className="dash-panel-title">
        <span className="section-kicker">Request Athletes</span>
        <Link to="/coach-requests">Open requests</Link>
      </div>
      <h2>Athletes waiting for you</h2>
      {!requests?.length && <p>No athlete requests yet. When an athlete chooses you, the request will appear here.</p>}
      <div className="dash-request-list">
        {requests?.slice(0, 4).map((request) => (
          <Link className="dash-request-card" key={request.id} to="/coach-requests">
            <div>
              <strong>{request.athlete.full_name}</strong>
              <small>{request.message || 'No message added.'}</small>
            </div>
            <span className={`request-status ${request.status}`}>{request.status.replace('_', ' ')}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function MakeProgramPanel({ acceptedCount }) {
  return (
    <section className="dash-panel">
      <div className="dash-panel-title"><span className="section-kicker">Make Program</span></div>
      <h2>Create a program for an accepted athlete</h2>
      <p>The athlete dropdown only shows athletes who selected you and whose request you accepted.</p>
      <div className="tool-grid two">
        <Link className="tool-card" to="/programs/new"><ClipboardList /> <b>Make Program</b><span>Choose an accepted athlete and write their plan.</span></Link>
        <Link className="tool-card" to="/coach-requests"><Inbox /> <b>Request Athletes</b><span>{acceptedCount} accepted request(s) are ready for program creation.</span></Link>
      </div>
    </section>
  );
}

function CoachManagePanel({ programs }) {
  return (
    <>
      <ProgramSummary programs={programs} user={{ role: 'coach' }} />
      <section className="dash-panel">
        <div className="dash-panel-title"><span className="section-kicker">Progress</span></div>
        <h2>Check athlete activity</h2>
        <p>Open a written program to see who the athlete is, how many weeks they completed, and edit or delete the program if needed.</p>
        <Link className="dash-primary-link" to="/programs">Open Manage Programs</Link>
      </section>
    </>
  );
}

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dashboard, setDashboard] = useState(null);
  const [profile, setProfile] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const active = searchParams.get('section') || 'overview';

  useEffect(() => {
    if (!isAuthenticated) return;
    async function load() {
      try {
        const requestPromise = user?.role === 'athlete'
          ? coachRequestApi.my()
          : user?.role === 'coach' || user?.role === 'admin'
            ? coachRequestApi.incoming()
            : Promise.resolve([]);
        const [dashData, profileData, programData, requestData] = await Promise.all([
          dashboardApi.me(),
          profileApi.me(),
          programApi.list(),
          requestPromise,
        ]);
        setDashboard(dashData);
        setProfile(profileData);
        setPrograms(programData);
        setRequests(requestData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isAuthenticated, user?.role]);

  const menuItems = useMemo(() => {
    const common = [{ key: 'overview', label: 'Overview', icon: UserRound }];
    if (user?.role === 'coach') {
      return [
        ...common,
        { key: 'request-athletes', label: 'Request Athletes', icon: Inbox },
        { key: 'make-program', label: 'Make Program', icon: ClipboardList },
        { key: 'manage-programs', label: 'Manage Programs', icon: Activity },
      ];
    }
    if (user?.role === 'admin') {
      return [...common, { key: 'admin', label: 'Admin Panel', icon: Settings }];
    }
    return [...common, { key: 'programs', label: 'Programs', icon: ClipboardList }];
  }, [user?.role]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  function setSection(key) {
    const params = new URLSearchParams(searchParams);
    if (key === 'overview') params.delete('section'); else params.set('section', key);
    setSearchParams(params, { replace: true });
  }

  function renderContent() {
    if (active === 'request-athletes' && user?.role === 'coach') return <CoachRequestSummary requests={requests} />;
    if (active === 'make-program' && user?.role === 'coach') return <MakeProgramPanel acceptedCount={requests.filter((item) => item.status === 'accepted').length} />;
    if (active === 'manage-programs' && user?.role === 'coach') return <CoachManagePanel programs={programs} />;
    if (active === 'programs' && user?.role === 'athlete') return <ProgramSummary programs={programs} user={user} requests={requests} />;
    if (active === 'admin') return <section className="dash-panel"><h2>Admin Panel</h2><p>Manage users, exercises, articles and system stats.</p><Link className="dash-primary-link" to="/admin">Open Admin Panel</Link></section>;
    return (
      <>
        <ProfileSummary profile={profile} user={user} />
        {user?.role === 'coach' ? (
          <>
            <CoachRequestSummary requests={requests} />
            <MakeProgramPanel acceptedCount={requests.filter((item) => item.status === 'accepted').length} />
            <CoachManagePanel programs={programs} />
          </>
        ) : (
          <ProgramSummary programs={programs} user={user} requests={requests} />
        )}
      </>
    );
  }

  return (
    <main className="dash-layout-page">
      <header className="dash-topbar">
        <Logo />
        <nav>
          <Link to="/">Landing</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/exercises">Exercises</Link>
        </nav>
      </header>
      <section className="dash-layout">
        <aside className="dash-sidebar">
          <div className="dash-user-card">
            <div className="dash-avatar">{user?.full_name?.slice(0, 1) || 'F'}</div>
            <h3>{user?.full_name}</h3>
            <p>{user?.role}</p>
          </div>
          <div className="dash-menu">
            {menuItems.map((item) => (
              <DashboardLink key={item.key} active={active === item.key || (active === 'overview' && item.key === 'overview')} icon={item.icon} label={item.label} onClick={() => setSection(item.key)} />
            ))}
          </div>
          <button type="button" className="dash-logout" onClick={logout}><LogOut size={18} /> Logout</button>
        </aside>
        <section className="dash-content">
          <div className="dash-welcome">
            <span className="section-kicker">Dashboard</span>
            <h1>{dashboard?.message || `Welcome, ${user?.full_name}`}</h1>
            <p>{dashboard?.next_step || 'Manage your profile, workout requests and programs from one clean panel.'}</p>
          </div>
          {loading && <div className="program-state">Loading dashboard...</div>}
          {error && <div className="server-error">{error}</div>}
          {!loading && !error && renderContent()}
        </section>
      </section>
    </main>
  );
}
