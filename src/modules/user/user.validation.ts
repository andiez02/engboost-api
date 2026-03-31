import { z } from 'zod';
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from '../../utils/constants';

export const registerSchema = z.object({
  email: z.string().regex(EMAIL_RULE, EMAIL_RULE_MESSAGE),
  password: z.string().regex(PASSWORD_RULE, PASSWORD_RULE_MESSAGE),
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export const verifySchema = z.object({
  email: z.string().email(),
  token: z.string().uuid('Invalid verification token.'),
});

export const updateUserSchema = z.object({
  username: z.string().max(100).optional(),
  avatar: z.string().nullable().optional(),
  current_password: z.string().optional(),
  new_password: z.string().optional(),
});
