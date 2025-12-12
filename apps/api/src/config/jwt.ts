import type { Secret, SignOptions } from 'jsonwebtoken';

const isProd = process.env.NODE_ENV === 'production';

export const JWT_SECRET: Secret = process.env.JWT_SECRET || (isProd ? '' : 'dev-jwt-secret');
export const JWT_REFRESH_SECRET: Secret = process.env.JWT_REFRESH_SECRET || (isProd ? '' : 'dev-jwt-refresh-secret');

export const JWT_EXPIRES_IN: SignOptions['expiresIn'] =
  (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '7d';

export const JWT_REFRESH_EXPIRES_IN: SignOptions['expiresIn'] =
  (process.env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn']) || '30d';

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET_NOT_CONFIGURED');
}
