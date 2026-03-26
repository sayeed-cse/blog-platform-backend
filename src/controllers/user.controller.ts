import { Request, Response } from 'express';
import { updateProfileSchema } from '../validations/profile.schema';
import { User } from '../models/user.model';
import { ApiError } from '../utils/api-error';
import { asyncHandler } from '../utils/async-handler';
import { pickUser } from '../utils/pick-user';
import { deleteLocalFileIfExists } from '../utils/file';

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized');
  }

  const payload = updateProfileSchema.parse(req.body);
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.name = payload.name;
  user.bio = payload.bio || '';

  if (req.file) {
    deleteLocalFileIfExists(user.avatar);
    user.avatar = `/uploads/${req.file.filename}`;
  } else if (payload.removeAvatar) {
    deleteLocalFileIfExists(user.avatar);
    user.avatar = '';
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: pickUser(user)
  });
});
