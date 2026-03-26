import { Response } from 'express';
import { env } from '../config/env';

export const attachAuthCookie = (res: Response, token: string) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: env.cookieExpiresDays * 24 * 60 * 60 * 1000
  });
};

export const clearAuthCookie = (res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax'
  });
};
