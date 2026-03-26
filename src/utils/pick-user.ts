import { IUserDocument } from '../models/user.model';

export const pickUser = (user: IUserDocument) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  bio: user.bio,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});
