import { Request, Response } from 'express';
import { loginSchema, registerSchema } from '../validations/auth.schema';
import { User } from '../models/user.model';
import { ApiError } from '../utils/api-error';
import { asyncHandler } from '../utils/async-handler';
import { signToken } from '../utils/jwt';
import { attachAuthCookie, clearAuthCookie } from '../utils/cookie';
import { pickUser } from '../utils/pick-user';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const payload = registerSchema.parse(req.body);

  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    throw new ApiError(409, 'Email already registered');
  }

  const user = await User.create(payload);
  const token = signToken(String(user._id));
  attachAuthCookie(res, token);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: pickUser(user)
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const payload = loginSchema.parse(req.body);

  const user = await User.findOne({ email: payload.email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await user.comparePassword(payload.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken(String(user._id));
  attachAuthCookie(res, token);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: pickUser(user)
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  clearAuthCookie(res);
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized');
  }

  res.status(200).json({
    success: true,
    data: pickUser(req.user)
  });
});
