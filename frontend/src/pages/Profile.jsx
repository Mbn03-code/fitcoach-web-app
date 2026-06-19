import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/ui/Logo.jsx';
import { profileApi } from '../api/profileApi.js';
import AthleteProfileForm from '../forms/profile/AthleteProfileForm.jsx';
import CoachProfileForm from '../forms/profile/CoachProfileForm.jsx';

export default function Profile() {
  const { isAuthenticated, user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    async function loadProfile() {
      try {
        const data = await profileApi.me();
        setProfileData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  function handleSaved(data) {
    setProfileData(data);
    setSavedMessage('Profile saved successfully.');
    window.setTimeout(() => setSavedMessage(''), 2500);
  }

  const activeUser = profileData?.user || user;
  const isAthlete = activeUser?.role === 'athlete';
  const isCoach = activeUser?.role === 'coach';

  return (
    <main className="dashboard-page profile-page">
      <section className="dashboard-card profile-card">
        <div className="profile-header">
          <Logo />
          <Link className="profile-back" to="/dashboard">Back to dashboard</Link>
        </div>
        <h1>Complete your profile</h1>
        <p>
          This profile is saved in the database and will be used later for training plans.
          Athletes fill goal and body information. Coaches fill specialty and experience.
        </p>

        {loading && <div className="profile-state">Loading profile...</div>}
        {error && <div className="server-error">{error}</div>}
        {savedMessage && <div className="dev-otp">{savedMessage}</div>}

        {!loading && profileData && (
          <>
            <div className="profile-status">
              <span>Role: {activeUser?.role}</span>
              <span>Status: {profileData.is_complete ? 'Complete' : 'Incomplete'}</span>
            </div>
            {isAthlete && (
              <AthleteProfileForm initialProfile={profileData.athlete_profile} onSaved={handleSaved} />
            )}
            {isCoach && (
              <CoachProfileForm initialProfile={profileData.coach_profile} onSaved={handleSaved} />
            )}
            {!isAthlete && !isCoach && <div className="profile-state">Admin does not need a public profile in this phase.</div>}
          </>
        )}
      </section>
    </main>
  );
}
