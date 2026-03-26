import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/user.model';
import { ApiError } from '../utils/api-error';

type JwtPayload = {
  userId: string;
};

export const protect = async (req: Request, _res: Response, next: NextFunction) => {
  const tokenFromCookie = req.cookies?.token;
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : undefined;

  const token = tokenFromCookie || tokenFromHeader;

  if (!token) {
    return next(new ApiError(401, 'Unauthorized'));
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return next(new ApiError(401, 'User not found'));
    }

    req.user = user;
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired token'));
  }
};
