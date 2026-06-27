import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import Logo from '../components/ui/Logo.jsx';
import { programApi } from '../api/programApi.js';
import { coachRequestApi } from '../api/coachRequestApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { programBaseSchema } from '../validation/programs/programSchemas.js';

function flattenErrors(result) {
  if (result.success) return {};
  const errors = {};
  result.error.issues.forEach((issue) => {
    const key = issue.path.join('.');
    errors[key] = issue.message;
  });
  return errors;
}

const emptyExercise = { exercise_id: '', day_number: 1, sets: 3, reps: 10, note: '' };

export default function CreateProgram() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('requestId');
  const { isAuthenticated, user } = useAuth();
  const [athletes, setAthletes] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [requestDetail, setRequestDetail] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    athlete_id: '',
    duration_weeks: 4,
    days_per_week: 3,
    exercises: [{ ...emptyExercise }],
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);

  const isCoach = user?.role === 'coach' || user?.role === 'admin';

  useEffect(() => {
    if (!isAuthenticated || !isCoach) return;
    async function boot() {
      try {
        const [athleteData, exerciseData, requestData] = await Promise.all([
          programApi.athletes(),
          programApi.exercises(),
          requestId ? coachRequestApi.detail(requestId) : Promise.resolve(null),
        ]);
        setAthletes(athleteData);
        setExercises(exerciseData);
        if (requestData) {
          setRequestDetail(requestData);
          setForm((prev) => ({
            ...prev,
            athlete_id: requestData.athlete.id,
            title: prev.title || `${requestData.athlete.full_name} Workout Program`,
            description: prev.description || `Program created from request #${requestData.id}.`,
          }));
        }
      } catch (err) {
        setServerError(err.message);
      } finally {
        setBootLoading(false);
      }
    }
    boot();
  }, [isAuthenticated, isCoach, requestId]);

  const firstExerciseId = useMemo(() => exercises[0]?.id || '', [exercises]);

  useEffect(() => {
    if (firstExerciseId && !form.exercises[0].exercise_id) {
      setForm((prev) => ({ ...prev, exercises: prev.exercises.map((item, index) => index === 0 ? { ...item, exercise_id: firstExerciseId } : item) }));
    }
  }, [firstExerciseId]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isCoach) return <Navigate to="/programs" replace />;

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateExercise(index, key, value) {
    setForm((prev) => ({
      ...prev,
      exercises: prev.exercises.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item),
    }));
  }

  function addExercise() {
    setForm((prev) => ({ ...prev, exercises: [...prev.exercises, { ...emptyExercise, exercise_id: firstExerciseId }] }));
  }

  function removeExercise(index) {
    setForm((prev) => ({ ...prev, exercises: prev.exercises.filter((_, itemIndex) => itemIndex !== index) }));
  }

  async function submit(event) {
    event.preventDefault();
    setServerError('');
    const result = programBaseSchema.safeParse(form);
    setErrors(flattenErrors(result));
    if (!result.success) return;
    setLoading(true);
    try {
      const payload = { ...result.data };
      const saved = requestId
        ? await programApi.createFromRequest(requestId, {
          title: payload.title,
          description: payload.description,
          duration_weeks: payload.duration_weeks,
          days_per_week: payload.days_per_week,
          exercises: payload.exercises,
        })
        : await programApi.create(payload);
      navigate(`/programs/${saved.id}`);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="program-page">
      <section className="program-shell narrow">
        <div className="program-header">
          <Logo />
          <div className="program-header__actions">
            <Link to="/programs">Back to programs</Link>
          </div>
        </div>

        <form className="program-form-card" onSubmit={submit} noValidate>
          <span className="section-kicker">Coach tool</span>
          <h1>Make Program</h1>
          <p>{requestId ? 'This program is connected to an accepted athlete request.' : 'Choose an accepted athlete request, define duration, and add exercises with day, sets and reps.'}</p>

          {bootLoading && <div className="program-state">Loading form data...</div>}
          {serverError && <div className="server-error">{serverError}</div>}
          {requestDetail && (
            <div className="request-inline-summary">
              <b>Request from {requestDetail.athlete.full_name}</b>
              <span>{requestDetail.message || 'No message added.'}</span>
              <small>Status: {requestDetail.status}</small>
            </div>
          )}

          <div className="program-form-grid">
            <label>
              Program title
              <input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Beginner Strength Plan" />
              {errors.title && <small>{errors.title}</small>}
            </label>
            <label>
              Choose Athlete
              <select value={form.athlete_id} onChange={(e) => update('athlete_id', e.target.value)} disabled={!!requestId}>
                <option value="">Select accepted athlete</option>
                {athletes.map((athlete) => <option key={athlete.id} value={athlete.id}>{athlete.full_name} - {athlete.phone}{athlete.request_id ? ` · Request #${athlete.request_id}` : ""}</option>)}
              </select>
              {errors.athlete_id && <small>{errors.athlete_id}</small>}
              {!requestId && !athletes.length && !bootLoading && <small>Accept an athlete request first. Accepted athletes will appear here.</small>}
            </label>
            <label>
              Duration weeks
              <input type="number" min="1" max="24" value={form.duration_weeks} onChange={(e) => update('duration_weeks', e.target.value)} />
              {errors.duration_weeks && <small>{errors.duration_weeks}</small>}
            </label>
            <label>
              Days per week
              <input type="number" min="1" max="7" value={form.days_per_week} onChange={(e) => update('days_per_week', e.target.value)} />
              {errors.days_per_week && <small>{errors.days_per_week}</small>}
            </label>
          </div>

          <label className="full-row">
            Description
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Short plan goal and notes..." />
          </label>

          <div className="exercise-editor-header">
            <h2>Exercises</h2>
            <button type="button" onClick={addExercise}><Plus size={18} /> Add exercise</button>
          </div>
          {errors.exercises && <small className="form-top-error">{errors.exercises}</small>}

          <div className="exercise-editor-list">
            {form.exercises.map((item, index) => (
              <div className="exercise-editor" key={`${index}-${item.exercise_id}`}>
                <div className="exercise-editor__title">
                  <b>Exercise {index + 1}</b>
                  {form.exercises.length > 1 && <button type="button" onClick={() => removeExercise(index)}><Trash2 size={16} /> Remove</button>}
                </div>
                <label>
                  Exercise
                  <select value={item.exercise_id} onChange={(e) => updateExercise(index, 'exercise_id', e.target.value)}>
                    <option value="">Select exercise</option>
                    {exercises.map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.name}</option>)}
                  </select>
                  {errors[`exercises.${index}.exercise_id`] && <small>{errors[`exercises.${index}.exercise_id`]}</small>}
                </label>
                <div className="program-form-grid mini">
                  <label>
                    Day
                    <input type="number" min="1" max="7" value={item.day_number} onChange={(e) => updateExercise(index, 'day_number', e.target.value)} />
                    {errors[`exercises.${index}.day_number`] && <small>{errors[`exercises.${index}.day_number`]}</small>}
                  </label>
                  <label>
                    Sets
                    <input type="number" min="1" value={item.sets} onChange={(e) => updateExercise(index, 'sets', e.target.value)} />
                    {errors[`exercises.${index}.sets`] && <small>{errors[`exercises.${index}.sets`]}</small>}
                  </label>
                  <label>
                    Reps
                    <input type="number" min="1" value={item.reps} onChange={(e) => updateExercise(index, 'reps', e.target.value)} />
                    {errors[`exercises.${index}.reps`] && <small>{errors[`exercises.${index}.reps`]}</small>}
                  </label>
                </div>
                <label>
                  Note
                  <input value={item.note} onChange={(e) => updateExercise(index, 'note', e.target.value)} placeholder="Optional note" />
                </label>
              </div>
            ))}
          </div>

          <button className="program-submit" type="submit" disabled={loading || bootLoading}>{loading ? 'Saving...' : 'Send Program'}</button>
        </form>
      </section>
    </main>
  );
}
