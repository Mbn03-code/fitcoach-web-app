import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Dumbbell, RotateCw } from 'lucide-react';
import Logo from '../components/ui/Logo.jsx';
import { programApi } from '../api/programApi.js';

const categoryLabels = {
  strength: 'Strength',
  'fat-loss': 'Fat Loss',
  'full-body': 'Full Body',
  mobility: 'Mobility',
};

export default function ExerciseLibrary() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setExercises(await programApi.exercises());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return exercises;
    return exercises.filter((item) => item.category === activeCategory);
  }, [exercises, activeCategory]);

  function chooseCategory(key) {
    const params = new URLSearchParams(searchParams);
    if (key === 'all') params.delete('category'); else params.set('category', key);
    setSearchParams(params, { replace: true });
  }

  return (
    <main className="program-page exercise-page">
      <section className="program-shell">
        <div className="program-header">
          <Logo />
          <div className="program-header__actions">
            <Link to="/">Landing</Link>
            <Link to="/coaches">Coaches</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
        </div>
        <div className="program-hero-card compact exercise-hero">
          <div>
            <span className="section-kicker">Exercise Library</span>
            <h1>{activeCategory === 'all' ? 'Simple beginner exercises' : `${categoryLabels[activeCategory]} exercises`}</h1>
            <p>Exercises come from the backend database. Video boxes are intentionally left empty so you can add your own media later.</p>
          </div>
          <Dumbbell size={58} />
        </div>

        <div className="exercise-filters">
          {['all', 'strength', 'fat-loss', 'full-body', 'mobility'].map((key) => (
            <button type="button" key={key} className={activeCategory === key ? 'active' : ''} onClick={() => chooseCategory(key)}>
              {key === 'all' ? 'All' : categoryLabels[key]}
            </button>
          ))}
        </div>

        {loading && <div className="program-state"><RotateCw className="spin" /> Loading exercises...</div>}
        {error && <div className="server-error">{error}</div>}
        <div className="exercise-grid exercise-video-grid">
          {filtered.map((item) => (
            <article className="exercise-card video-card" key={item.id}>
              <div className="exercise-video-placeholder" aria-label="Video placeholder" />
              <span>{categoryLabels[item.category] || item.target_muscle}</span>
              <h2>{item.name}</h2>
              <p>{item.description}</p>
              <small><Dumbbell size={14} /> Target: {item.target_muscle}</small>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
