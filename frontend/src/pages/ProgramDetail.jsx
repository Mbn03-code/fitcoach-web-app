import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Trash2 } from 'lucide-react';
import Logo from '../components/ui/Logo.jsx';
import { programApi } from '../api/programApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { programUpdateSchema } from '../validation/programs/programSchemas.js';

function groupByDay(exercises) {
  return exercises.reduce((acc, item) => {
    const key = `Day ${item.day_number}`;
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});
}

function isWeekDone(program, week) {
  return program.logs?.some((log) => log.week_number === week && log.completed);
}

function flatErrors(result) {
  if (result.success) return {};
  return Object.fromEntries(result.error.issues.map((issue) => [issue.path[0], issue.message]));
}

export default function ProgramDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [program, setProgram] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', duration_weeks: 4, days_per_week: 3 });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    async function load() {
      try {
        const data = await programApi.detail(id);
        setProgram(data);
        setForm({ title: data.title, description: data.description || '', duration_weeks: data.duration_weeks, days_per_week: data.days_per_week });
      } catch (err) {
        setServerError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, isAuthenticated]);

  const grouped = useMemo(() => groupByDay(program?.exercises || []), [program]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const isCoachOwner = user?.role === 'admin' || (user?.role === 'coach' && program?.coach?.id === user?.id);
  const isAssignedAthlete = user?.role === 'athlete' && program?.athlete?.id === user?.id;

  async function saveBasic(event) {
    event.preventDefault();
    setMessage('');
    setServerError('');
    const result = programUpdateSchema.safeParse(form);
    setErrors(flatErrors(result));
    if (!result.success) return;
    setSaving(true);
    try {
      const updated = await programApi.update(id, result.data);
      setProgram(updated);
      setMessage('Program updated successfully.');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeProgram() {
    if (!window.confirm('Delete this program?')) return;
    setSaving(true);
    try {
      await programApi.remove(id);
      navigate('/programs');
    } catch (err) {
      setServerError(err.message);
      setSaving(false);
    }
  }

  async function toggleWeek(week, completed) {
    setSaving(true);
    setServerError('');
    try {
      const updated = await programApi.completeWeek(id, { week_number: week, completed, note: completed ? 'Completed from athlete dashboard' : '' });
      setProgram(updated);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="program-page">
      <section className="program-shell">
        <div className="program-header">
          <Logo />
          <div className="program-header__actions">
            <Link to="/programs">Back to programs</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
        </div>

        {loading && <div className="program-state">Loading program...</div>}
        {serverError && <div className="server-error">{serverError}</div>}

        {!loading && program && (
          <>
            <div className="program-detail-hero">
              <span className="section-kicker">Workout program</span>
              <h1>{program.title}</h1>
              <p>{program.description || 'No description added.'}</p>
              <div className="program-meta-row">
                <span>{program.duration_weeks} weeks</span>
                <span>{program.days_per_week} days per week</span>
                <span>Coach: {program.coach.full_name}</span>
                <span>Athlete: {program.athlete.full_name}</span>
              </div>
            </div>

            {isCoachOwner && (
              <form className="program-form-card edit-card" onSubmit={saveBasic} noValidate>
                <div className="exercise-editor__title">
                  <h2>Edit program info</h2>
                  <button className="danger-button" type="button" onClick={removeProgram} disabled={saving}><Trash2 size={16} /> Delete</button>
                </div>
                {message && <div className="dev-otp">{message}</div>}
                <div className="program-form-grid">
                  <label>
                    Title
                    <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
                    {errors.title && <small>{errors.title}</small>}
                  </label>
                  <label>
                    Duration weeks
                    <input type="number" value={form.duration_weeks} onChange={(e) => setForm((p) => ({ ...p, duration_weeks: e.target.value }))} />
                    {errors.duration_weeks && <small>{errors.duration_weeks}</small>}
                  </label>
                  <label>
                    Days per week
                    <input type="number" value={form.days_per_week} onChange={(e) => setForm((p) => ({ ...p, days_per_week: e.target.value }))} />
                    {errors.days_per_week && <small>{errors.days_per_week}</small>}
                  </label>
                </div>
                <label className="full-row">
                  Description
                  <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                </label>
                <button className="program-submit" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
              </form>
            )}

            <div className="program-two-column">
              <section className="program-list-panel">
                <h2>Exercises by day</h2>
                {Object.entries(grouped).map(([day, items]) => (
                  <div className="day-panel" key={day}>
                    <h3>{day}</h3>
                    {items.map((item) => (
                      <div className="workout-row" key={item.id}>
                        <div>
                          <b>{item.exercise.name}</b>
                          <span>{item.exercise.target_muscle}</span>
                        </div>
                        <strong>{item.sets} x {item.reps}</strong>
                        {item.note && <p>{item.note}</p>}
                      </div>
                    ))}
                  </div>
                ))}
              </section>

              <section className="program-list-panel progress-panel">
                <h2>Weekly progress</h2>
                <p>Only the assigned athlete can mark weeks as completed.</p>
                <div className="week-grid">
                  {Array.from({ length: program.duration_weeks }, (_, index) => index + 1).map((week) => {
                    const done = isWeekDone(program, week);
                    return (
                      <button
                        key={week}
                        type="button"
                        className={done ? 'week-button done' : 'week-button'}
                        disabled={!isAssignedAthlete || saving}
                        onClick={() => toggleWeek(week, !done)}
                      >
                        <CheckCircle2 size={18} /> Week {week}
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
