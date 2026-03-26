import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Comment } from '../models/comment.model';
import { ApiError } from '../utils/api-error';
import { asyncHandler } from '../utils/async-handler';
import { createCommentSchema, updateCommentSchema } from '../validations/comment.schema';

export const getCommentsByPost = asyncHandler(async (req: Request, res: Response) => {
  const comments = await Comment.find({ post: req.params.postId })
    .populate('user', 'name email avatar')
    .sort({ createdAt: 1 })
    .lean();

  const map = new Map<string, any>();
  const roots: any[] = [];

  comments.forEach((comment) => {
    map.set(String(comment._id), { ...comment, replies: [] });
  });

  comments.forEach((comment) => {
    const current = map.get(String(comment._id));
    if (comment.parentComment) {
      const parent = map.get(String(comment.parentComment));
      if (parent) {
        parent.replies.push(current);
      } else {
        roots.push(current);
      }
    } else {
      roots.push(current);
    }
  });

  res.status(200).json({
    success: true,
    data: roots
  });
});

export const createComment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized');
  }

  const payload = createCommentSchema.parse(req.body);

  let depth = 0;
  let parentCommentId: mongoose.Types.ObjectId | null = null;

  if (payload.parentCommentId) {
    const parent = await Comment.findById(payload.parentCommentId);
    if (!parent) {
      throw new ApiError(404, 'Parent comment not found');
    }

    if (String(parent.post) !== payload.postId) {
      throw new ApiError(400, 'Parent comment does not belong to this post');
    }

    if (parent.depth >= 4) {
      throw new ApiError(400, 'Maximum reply depth reached');
    }

    depth = parent.depth + 1;
    parentCommentId = parent._id as mongoose.Types.ObjectId;
  }

  const comment = await Comment.create({
    post: payload.postId,
    user: req.user._id,
    content: payload.content,
    parentComment: parentCommentId,
    depth
  });

  const populated = await comment.populate('user', 'name email avatar');

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    data: populated
  });
});

export const updateComment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized');
  }

  const payload = updateCommentSchema.parse(req.body);
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  if (String(comment.user) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only update your own comments');
  }

  comment.content = payload.content;
  await comment.save();
  const populated = await comment.populate('user', 'name email avatar');

  res.status(200).json({
    success: true,
    message: 'Comment updated successfully',
    data: populated
  });
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized');
  }

  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  if (String(comment.user) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only delete your own comments');
  }

  const allComments = await Comment.find({ post: comment.post }).select('_id parentComment');
  const childrenMap = new Map<string, string[]>();

  allComments.forEach((item) => {
    const parent = item.parentComment ? String(item.parentComment) : null;
    if (!parent) return;
    const list = childrenMap.get(parent) || [];
    list.push(String(item._id));
    childrenMap.set(parent, list);
  });

  const idsToDelete = new Set<string>([String(comment._id)]);
  const queue = [String(comment._id)];

  while (queue.length) {
    const current = queue.shift()!;
    const children = childrenMap.get(current) || [];
    for (const child of children) {
      if (!idsToDelete.has(child)) {
        idsToDelete.add(child);
        queue.push(child);
      }
    }
  }

  await Comment.deleteMany({ _id: { $in: Array.from(idsToDelete) } });

  res.status(200).json({
    success: true,
    message: 'Comment deleted successfully'
  });
});
