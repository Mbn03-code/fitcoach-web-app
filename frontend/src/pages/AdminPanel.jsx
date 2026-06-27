import { useEffect, useMemo, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { CheckCircle2, Dumbbell, Loader2, Newspaper, Shield, Trash2, UserCheck, Users } from 'lucide-react';
import { adminApi } from '../api/adminApi.js';
import Logo from '../components/ui/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const emptyExercise = { name: '', target_muscle: '', description: '' };
const emptyArticle = { title: '', read_time: '', slug: '', summary: '', content: '' };

function StatBox({ label, value, icon: Icon }) {
  return <div className="admin-stat"><Icon size={22} /><strong>{value}</strong><span>{label}</span></div>;
}

export default function AdminPanel() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [articles, setArticles] = useState([]);
  const [exerciseForm, setExerciseForm] = useState(emptyExercise);
  const [articleForm, setArticleForm] = useState(emptyArticle);
  const [editingExerciseId, setEditingExerciseId] = useState(null);
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAdmin = user?.role === 'admin';

  async function loadAdmin() {
    setError('');
    try {
      const [statsData, usersData, exerciseData, articleData] = await Promise.all([
        adminApi.stats(),
        adminApi.users(),
        adminApi.exercises(),
        adminApi.articles(),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setExercises(exerciseData);
      setArticles(articleData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated && isAdmin) loadAdmin();
  }, [isAuthenticated, isAdmin]);

  const statItems = useMemo(() => [
    ['Total users', stats?.total_users ?? 0, Users],
    ['Verified users', stats?.verified_users ?? 0, UserCheck],
    ['Programs', stats?.programs ?? 0, Dumbbell],
    ['Completed weeks', stats?.completed_weeks ?? 0, CheckCircle2],
    ['Exercises', stats?.exercises ?? 0, Dumbbell],
    ['Articles', stats?.articles ?? 0, Newspaper],
  ], [stats]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  async function toggleUserStatus(item) {
    setSuccess('');
    await adminApi.updateUserStatus(item.id, !item.is_active);
    setSuccess('User status updated.');
    loadAdmin();
  }

  async function removeUser(id) {
    if (!confirm('Remove this user?')) return;
    setSuccess('');
    await adminApi.deleteUser(id);
    setSuccess('User removed.');
    loadAdmin();
  }

  function editExercise(exercise) {
    setEditingExerciseId(exercise.id);
    setExerciseForm({
      name: exercise.name || '',
      target_muscle: exercise.target_muscle || '',
      description: exercise.description || '',
    });
  }

  async function saveExercise(event) {
    event.preventDefault();
    setSuccess('');
    if (editingExerciseId) {
      await adminApi.updateExercise(editingExerciseId, exerciseForm);
      setSuccess('Exercise updated.');
    } else {
      await adminApi.createExercise(exerciseForm);
      setSuccess('Exercise created.');
    }
    setExerciseForm(emptyExercise);
    setEditingExerciseId(null);
    loadAdmin();
  }

  async function deleteExercise(id) {
    if (!confirm('Delete this exercise?')) return;
    await adminApi.deleteExercise(id);
    setSuccess('Exercise deleted.');
    loadAdmin();
  }

  function editArticle(article) {
    setEditingArticleId(article.id);
    setArticleForm({
      title: article.title || '',
      read_time: article.read_time || '',
      slug: article.slug || '',
      summary: article.summary || '',
      content: article.content || '',
    });
  }

  async function saveArticle(event) {
    event.preventDefault();
    setSuccess('');
    if (editingArticleId) {
      await adminApi.updateArticle(editingArticleId, articleForm);
      setSuccess('Article updated.');
    } else {
      await adminApi.createArticle(articleForm);
      setSuccess('Article created.');
    }
    setArticleForm(emptyArticle);
    setEditingArticleId(null);
    loadAdmin();
  }

  async function deleteArticle(id) {
    if (!confirm('Delete this article?')) return;
    await adminApi.deleteArticle(id);
    setSuccess('Article deleted.');
    loadAdmin();
  }

  return (
    <main className="program-page admin-page">
      <div className="program-shell">
        <header className="program-header">
          <Logo />
          <div className="program-header__actions">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/programs">Programs</Link>
            <Link to="/">Landing</Link>
          </div>
        </header>

        <section className="program-hero-card compact admin-hero">
          <div>
            <p className="section-kicker"><Shield size={16} /> ADMIN PANEL</p>
            <h1>Manage users, content, and app data.</h1>
            <p>This page completes the final project admin role requirement with user management, content management, and summary statistics.</p>
          </div>
        </section>

        {loading && <div className="program-state"><Loader2 className="spin" /> Loading admin panel...</div>}
        {error && <div className="server-error">{error}</div>}
        {success && <div className="admin-success">{success}</div>}

        {!loading && stats && (
          <section className="admin-stats-grid">
            {statItems.map(([label, value, Icon]) => <StatBox key={label} label={label} value={value} icon={Icon} />)}
          </section>
        )}

        <section className="admin-section">
          <h2>Users</h2>
          <div className="admin-table">
            {users.map((item) => (
              <div className="admin-row" key={item.id}>
                <div><strong>{item.full_name}</strong><span>{item.phone} · {item.role} · {item.is_verified ? 'verified' : 'not verified'}</span></div>
                <div className="admin-row-actions">
                  <button onClick={() => toggleUserStatus(item)}>{item.is_active ? 'Deactivate' : 'Activate'}</button>
                  <button className="danger-button" onClick={() => removeUser(item.id)}><Trash2 size={15} /> Remove</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-two-col">
          <div className="admin-section">
            <h2>{editingExerciseId ? 'Edit exercise' : 'Add exercise'}</h2>
            <form className="admin-form" onSubmit={saveExercise}>
              <input placeholder="Exercise name" value={exerciseForm.name} onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })} required />
              <input placeholder="Target muscle" value={exerciseForm.target_muscle} onChange={(e) => setExerciseForm({ ...exerciseForm, target_muscle: e.target.value })} />
              <textarea placeholder="Description" value={exerciseForm.description} onChange={(e) => setExerciseForm({ ...exerciseForm, description: e.target.value })} />
              <button className="program-submit">{editingExerciseId ? 'Save exercise' : 'Create exercise'}</button>
              {editingExerciseId && <button type="button" className="admin-cancel" onClick={() => { setEditingExerciseId(null); setExerciseForm(emptyExercise); }}>Cancel edit</button>}
            </form>
            <div className="admin-mini-list">
              {exercises.map((item) => (
                <div key={item.id}>
                  <span><b>{item.name}</b>{item.target_muscle}</span>
                  <button onClick={() => editExercise(item)}>Edit</button>
                  <button onClick={() => deleteExercise(item.id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-section">
            <h2>{editingArticleId ? 'Edit article' : 'Add article'}</h2>
            <form className="admin-form" onSubmit={saveArticle}>
              <input placeholder="Title" value={articleForm.title} onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })} required />
              <input placeholder="Read time" value={articleForm.read_time} onChange={(e) => setArticleForm({ ...articleForm, read_time: e.target.value })} required />
              <input placeholder="slug-example" value={articleForm.slug} onChange={(e) => setArticleForm({ ...articleForm, slug: e.target.value })} required />
              <textarea placeholder="Summary" value={articleForm.summary} onChange={(e) => setArticleForm({ ...articleForm, summary: e.target.value })} />
              <textarea placeholder="Content" value={articleForm.content} onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })} />
              <button className="program-submit">{editingArticleId ? 'Save article' : 'Create article'}</button>
              {editingArticleId && <button type="button" className="admin-cancel" onClick={() => { setEditingArticleId(null); setArticleForm(emptyArticle); }}>Cancel edit</button>}
            </form>
            <div className="admin-mini-list">
              {articles.map((item) => (
                <div key={item.id}>
                  <span><b>{item.title}</b>{item.slug}</span>
                  <button onClick={() => editArticle(item)}>Edit</button>
                  <button onClick={() => deleteArticle(item.id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
