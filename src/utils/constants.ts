export const EMAIL_RULE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const EMAIL_RULE_MESSAGE = 'Please provide a valid email address.';

export const PASSWORD_RULE = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d\W]{8,256}$/;
export const PASSWORD_RULE_MESSAGE =
  'Password must be at least 8 characters and include both letters and numbers.';

export const ROLES = {
  CLIENT: 'CLIENT',
  ADMIN: 'ADMIN',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
