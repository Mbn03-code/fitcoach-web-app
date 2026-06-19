import { useState } from 'react';
import { athleteProfileSchema } from '../../validation/profile/profileSchemas.js';
import { profileApi } from '../../api/profileApi.js';

function getErrors(error) {
  const errors = {};
  if (error?.issues) {
    error.issues.forEach((issue) => { errors[issue.path[0]] = issue.message; });
  }
  return errors;
}

export default function AthleteProfileForm({ initialProfile, onSaved }) {
  const [form, setForm] = useState({
    height_cm: initialProfile?.height_cm || '',
    weight_kg: initialProfile?.weight_kg || '',
    goal: initialProfile?.goal || '',
    level: initialProfile?.level || '',
    available_days_per_week: initialProfile?.available_days_per_week || '',
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
    const parsed = athleteProfileSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(getErrors(parsed.error));
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const data = await profileApi.updateAthlete(parsed.data);
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
      <label>Height (cm)<input name="height_cm" value={form.height_cm} onChange={change} placeholder="175" /></label>
      {errors.height_cm && <small>{errors.height_cm}</small>}
      <label>Weight (kg)<input name="weight_kg" value={form.weight_kg} onChange={change} placeholder="70" /></label>
      {errors.weight_kg && <small>{errors.weight_kg}</small>}
      <label>Goal<input name="goal" value={form.goal} onChange={change} placeholder="Fat loss / Muscle gain" /></label>
      {errors.goal && <small>{errors.goal}</small>}
      <label>Level<input name="level" value={form.level} onChange={change} placeholder="Beginner / Intermediate" /></label>
      {errors.level && <small>{errors.level}</small>}
      <label>Available days per week<input name="available_days_per_week" value={form.available_days_per_week} onChange={change} placeholder="3" /></label>
      {errors.available_days_per_week && <small>{errors.available_days_per_week}</small>}
      <button className="profile-save" disabled={loading}>{loading ? 'Saving...' : 'Save athlete profile'}</button>
    </form>
  );
}
