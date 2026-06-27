import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Dumbbell, RotateCw, Star } from 'lucide-react';
import Logo from '../components/ui/Logo.jsx';
import { coachApi } from '../api/coachApi.js';

export default function Coaches() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setCoaches(await coachApi.list());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="program-page coaches-page">
      <section className="program-shell">
        <div className="program-header">
          <Logo />
          <div className="program-header__actions">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/exercises">Exercises</Link>
          </div>
        </div>

        <div className="program-hero-card compact coach-hero left-aligned">
          <div>
            <span className="section-kicker">Find Coaches</span>
            <h1>Choose a coach for your next plan</h1>
            <p>Open a coach card, read the details, and ask them to create a workout program based on your profile.</p>
          </div>
          <Dumbbell size={58} />
        </div>

        {loading && <div className="program-state"><RotateCw className="spin" /> Loading coaches...</div>}
        {error && <div className="server-error">{error}</div>}

        <div className="coach-grid left-aligned">
          {coaches.map((coach) => (
            <Link className="coach-card no-avatar" to={`/coaches/${coach.id}`} key={coach.id}>
              <div className="coach-card__top no-avatar-top">
                <span><Star size={16} /> {coach.rating.toFixed(1)}</span>
                <small>{coach.experience_years} years experience</small>
              </div>
              <h2>{coach.full_name}</h2>
              <p className="coach-specialty"><BadgeCheck size={16} /> {coach.specialty}</p>
              <p>{coach.bio}</p>
              <div className="coach-tags">
                {coach.tags.map((tag) => <small key={tag}>{tag}</small>)}
              </div>
              <div className="coach-card__footer">
                <span>{coach.programs_count} written programs</span>
                <b>View details <ArrowRight size={16} /></b>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
