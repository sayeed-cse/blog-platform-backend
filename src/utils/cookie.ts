import { Response } from 'express';
import { env } from '../config/env';

const isProduction = env.nodeEnv === 'production';

export const attachAuthCookie = (res: Response, token: string) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: env.cookieExpiresDays * 24 * 60 * 60 * 1000
  });
};

export const clearAuthCookie = (res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  });
};