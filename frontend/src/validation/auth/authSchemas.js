import { z } from 'zod';

const iranPhone = /^09\d{9}$/;
const lettersOnly = /^[A-Za-zآ-یءئؤإأۀ\s]+$/;

export const registerSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, 'Full name is required')
    .regex(lettersOnly, 'Full name must contain letters only'),
  phone: z
    .string()
    .trim()
    .regex(iranPhone, 'Phone number must be a valid Iranian number, like 09123456789'),
  role: z.enum(['athlete', 'coach']),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password is too long'),
  confirm_password: z.string().min(8, 'Confirm password is required').max(128, 'Password is too long'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

export const loginPasswordSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(iranPhone, 'Phone number must be a valid Iranian number, like 09123456789'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password is too long'),
});

export const requestCodeSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(iranPhone, 'Phone number must be a valid Iranian number, like 09123456789'),
});

export const verifyCodeSchema = z.object({
  code: z.string().min(4, 'Code is required').max(6, 'Code is too long'),
});
