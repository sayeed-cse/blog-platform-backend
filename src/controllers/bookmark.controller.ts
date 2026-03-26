import { Request, Response } from 'express';
import { Bookmark } from '../models/bookmark.model';
import { Post } from '../models/post.model';
import { ApiError } from '../utils/api-error';
import { asyncHandler } from '../utils/async-handler';

export const getBookmarks = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized');
  }

  const items = await Bookmark.find({ user: req.user._id })
    .populate({
      path: 'post',
      populate: {
        path: 'author',
        select: 'name email avatar bio'
      }
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: items
  });
});

export const addBookmark = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized');
  }

  const post = await Post.findById(req.params.postId);
  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  const existing = await Bookmark.findOne({ user: req.user._id, post: post._id });
  if (existing) {
    return res.status(200).json({
      success: true,
      message: 'Post already bookmarked',
      data: existing
    });
  }

  const bookmark = await Bookmark.create({
    user: req.user._id,
    post: post._id
  });

  res.status(201).json({
    success: true,
    message: 'Post bookmarked successfully',
    data: bookmark
  });
});

export const removeBookmark = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized');
  }

  await Bookmark.findOneAndDelete({
    user: req.user._id,
    post: req.params.postId
  });

  res.status(200).json({
    success: true,
    message: 'Bookmark removed successfully'
  });
});
