import { z } from 'zod';

const optionalNumber = (min, max, label) =>
  z.preprocess(
    (value) => (value === '' || value === null ? undefined : Number(value)),
    z.number({ invalid_type_error: `${label} must be a number` }).min(min).max(max).optional()
  );

export const athleteProfileSchema = z.object({
  height_cm: optionalNumber(100, 250, 'Height'),
  weight_kg: optionalNumber(30, 250, 'Weight'),
  goal: z.string().min(2, 'Goal is required').max(100),
  level: z.string().min(2, 'Level is required').max(50),
  available_days_per_week: optionalNumber(1, 7, 'Available days'),
});

export const coachProfileSchema = z.object({
  specialty: z.string().min(2, 'Specialty is required').max(100),
  experience_years: optionalNumber(0, 60, 'Experience'),
  bio: z.string().min(10, 'Bio must be at least 10 characters').max(800),
});
