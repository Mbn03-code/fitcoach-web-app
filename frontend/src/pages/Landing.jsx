import { useEffect, useState } from 'react';
import { ArrowRight, Dumbbell, FileText, Menu, Play, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { publicApi } from '../api/publicApi.js';
import TopNav from '../components/ui/TopNav.jsx';

const statIcons = { users: Users, play: Play, star: Star };

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    publicApi.landing()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const fallback = {
    brand: 'Futurea',
    hero: { headline: ['UNLEASH', 'YOUR', 'POTENTIAL'], subtitle: 'Personalized workouts, expert coaching, and progress tracking in one clean app.' },
    stats: [
      { value: '10K+', label: 'Happy Members', icon: 'users' },
      { value: '500+', label: 'Workout Plans', icon: 'play' },
      { value: '4.9', label: 'Average Rating', icon: 'star' },
    ],
    categories: [
      { title: 'Strength', subtitle: 'Build muscle with smart gym plans.', image_hint: 'strength' },
      { title: 'Fat Loss', subtitle: 'HIIT, cardio, and daily burn goals.', image_hint: 'fat-loss' },
      { title: 'Full Body', subtitle: 'Balanced routines for total fitness.', image_hint: 'full-body' },
      { title: 'Mobility', subtitle: 'Improve flexibility and joint control.', image_hint: 'mobility' },
    ],
    articles: [
      { title: '5 beginner workouts to start this week', read_time: '6 min read', slug: 'beginner-workouts' },
      { title: 'How to stay consistent on busy days', read_time: '4 min read', slug: 'stay-consistent' },
      { title: 'Simple meal prep for fitness beginners', read_time: '7 min read', slug: 'meal-prep' },
    ],
  };
  const page = data || fallback;

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <TopNav />
        <div className="hero-grid">
          <div className="hero-copy">
            <h1>
              <span>{page.hero.headline[0]}</span>
              <span>{page.hero.headline[1]}</span>
              <span className="green-text">{page.hero.headline[2]}</span>
            </h1>
            <p>{page.hero.subtitle}</p>
            <div className="hero-actions">
              <Link to={isAuthenticated ? "/coaches" : "/register"} className="btn-green">Build Your Plan <ArrowRight size={20} /></Link>
              <Link className="btn-outline" to="/exercises"><Play size={18} /> Watch Intro</Link>
            </div>
          </div>
          <div className="hero-visual"><div className="runner-silhouette" /></div>
        </div>
        <div className="stats-row">
          {page.stats.map((item) => {
            const Icon = statIcons[item.icon] || Dumbbell;
            return <div className="stat-card" key={item.label}><Icon size={22} /><strong>{item.value}</strong><span>{item.label}</span></div>;
          })}
        </div>
      </section>

      <section id="why" className="why-section">
        <p className="section-kicker">WHY IT WORKS</p>
        <h2>Simple plans.<br />Real progress.<br />No noise.</h2>
        <p className="why-text">Everything is built for beginners: clear workouts, small steps, and coaching that keeps you moving without overwhelming your day.</p>
      </section>

      <section id="coaches" className="coach-card-section">
        <div className="coach-card">
          <div>
            <h2>Coaching that fits<br />your real life.</h2>
            <p>Get a trainer-led plan without complicated dashboards, noisy cards or pressure.</p>
            <Link to={isAuthenticated ? "/coaches" : "/register"} className="btn-green small">Find Coach <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>

      <section id="workouts" className="workout-section">
        <h2>Explore Workouts by Goal</h2>
        {loading && <p className="state-text">Loading workouts from backend...</p>}
        {error && <p className="state-text error">Backend fetch failed: {error}</p>}
        <div className="workout-grid">
          {page.categories.map((category) => (
            <Link className="workout-card" key={category.title} to={`/exercises?category=${category.image_hint}`}>
              <div className={`workout-img ${category.image_hint}`} />
              <h3>{category.title}</h3>
              <p>{category.subtitle}</p>
              <span className="workout-card-link">Open exercises <ArrowRight size={15} /></span>
            </Link>
          ))}
        </div>
      </section>

      <section id="stories" className="tips-section">
        <h2>Tips, Guides & Inspiration</h2>
        <p>Short reads to keep you consistent.</p>
        <div className="article-list">
          {page.articles.map((article, index) => {
            const slugs = ['beginner-workouts', 'stay-consistent', 'meal-prep'];
            const slug = article.slug || slugs[index] || 'beginner-workouts';
            return (
              <Link className="article-row" key={article.title} to={`/articles/${slug}`}>
                <FileText size={20} />
                <div><h3>{article.title}</h3><span>{article.read_time}</span></div>
                <ArrowRight className="orange-arrow" />
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-brand"><Dumbbell /> <strong>Futurea</strong><p>Your fitness journey, simplified. Built for real life.</p></div>
        <div className="footer-cols">
          <div><h4>APP</h4><a href="#workouts">Workouts</a><a href="#coaches">Coaches</a><Link to={isAuthenticated ? "/dashboard" : "/register"}>Pricing</Link></div>
          <div><h4>COMPANY</h4><a href="#why">About</a><a href="#stories">Stories</a><Link to={isAuthenticated ? "/dashboard" : "/login"}>Contact</Link></div>
          <div><h4>LEGAL</h4><Link to="/dashboard">Privacy</Link><Link to="/dashboard">Terms</Link><Link to="/dashboard">Support</Link></div>
        </div>
        <small>© 2026 Futurea. All rights reserved.</small>
      </footer>
    </main>
  );
}
