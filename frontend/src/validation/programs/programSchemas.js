import { z } from 'zod';

export const programBaseSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters.'),
  description: z.string().trim().optional(),
  athlete_id: z.coerce.number().int().positive('Choose an athlete.'),
  duration_weeks: z.coerce.number().int().min(1, 'Minimum is 1 week.').max(24, 'Maximum is 24 weeks.'),
  days_per_week: z.coerce.number().int().min(1, 'Minimum is 1 day.').max(7, 'Maximum is 7 days.'),
  exercises: z.array(z.object({
    exercise_id: z.coerce.number().int().positive('Choose an exercise.'),
    day_number: z.coerce.number().int().min(1, 'Day must be at least 1.').max(7, 'Maximum day is 7.'),
    sets: z.coerce.number().int().min(1, 'Sets must be at least 1.').max(20, 'Sets are too high.'),
    reps: z.coerce.number().int().min(1, 'Reps must be at least 1.').max(100, 'Reps are too high.'),
    note: z.string().trim().optional(),
  })).min(1, 'Add at least one exercise.'),
}).superRefine((data, ctx) => {
  data.exercises.forEach((item, index) => {
    if (item.day_number > data.days_per_week) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['exercises', index, 'day_number'], message: 'Day cannot be more than days per week.' });
    }
  });
});

export const programUpdateSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters.'),
  description: z.string().trim().optional(),
  duration_weeks: z.coerce.number().int().min(1, 'Minimum is 1 week.').max(24, 'Maximum is 24 weeks.'),
  days_per_week: z.coerce.number().int().min(1, 'Minimum is 1 day.').max(7, 'Maximum is 7 days.'),
});
