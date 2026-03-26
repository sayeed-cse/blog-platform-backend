import { z } from 'zod';

export const createCommentSchema = z.object({
  postId: z.string().min(1, 'Post ID is required'),
  content: z.string().min(1, 'Comment is required').max(1000),
  parentCommentId: z.string().optional()
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment is required').max(1000)
});
