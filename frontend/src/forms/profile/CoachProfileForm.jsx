import { useState } from 'react';
import { coachProfileSchema } from '../../validation/profile/profileSchemas.js';
import { profileApi } from '../../api/profileApi.js';

function getErrors(error) {
  const errors = {};
  if (error?.issues) {
    error.issues.forEach((issue) => { errors[issue.path[0]] = issue.message; });
  }
  return errors;
}

export default function CoachProfileForm({ initialProfile, onSaved }) {
  const [form, setForm] = useState({
    specialty: initialProfile?.specialty || '',
    experience_years: initialProfile?.experience_years || '',
    bio: initialProfile?.bio || '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  function change(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setServerError('');
    const parsed = coachProfileSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(getErrors(parsed.error));
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const data = await profileApi.updateCoach(parsed.data);
      onSaved(data);
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="profile-form" onSubmit={submit}>
      {serverError && <div className="server-error">{serverError}</div>}
      <label>Specialty<input name="specialty" value={form.specialty} onChange={change} placeholder="Strength training" /></label>
      {errors.specialty && <small>{errors.specialty}</small>}
      <label>Experience years<input name="experience_years" value={form.experience_years} onChange={change} placeholder="4" /></label>
      {errors.experience_years && <small>{errors.experience_years}</small>}
      <label>Bio<textarea name="bio" value={form.bio} onChange={change} placeholder="Write a short coach bio..." /></label>
      {errors.bio && <small>{errors.bio}</small>}
      <button className="profile-save" disabled={loading}>{loading ? 'Saving...' : 'Save coach profile'}</button>
    </form>
  );
}
