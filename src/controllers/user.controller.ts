import { Request, Response } from 'express';
import { updateProfileSchema } from '../validations/profile.schema';
import { User } from '../models/user.model';
import { ApiError } from '../utils/api-error';
import { asyncHandler } from '../utils/async-handler';
import { pickUser } from '../utils/pick-user';
import { deleteCloudinaryImageByPublicId, uploadImageBuffer } from '../utils/cloudinary';
import { deleteLocalFileIfExists } from '../utils/file';

const removeAvatar = async (avatar?: string | null, publicId?: string | null) => {
  if (publicId) {
    await deleteCloudinaryImageByPublicId(publicId);
  }
  deleteLocalFileIfExists(avatar);
};

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

  if (req.file?.buffer) {
    await removeAvatar(user.avatar, user.avatarPublicId);
    const uploaded = await uploadImageBuffer(req.file.buffer, 'blog-platform/avatars');
    user.avatar = uploaded.secure_url;
    user.avatarPublicId = uploaded.public_id;
  } else if (payload.removeAvatar) {
    await removeAvatar(user.avatar, user.avatarPublicId);
    user.avatar = '';
    user.avatarPublicId = '';
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: pickUser(user)
  });
});
