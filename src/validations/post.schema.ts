import { z } from 'zod';

const normalizeTags = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
};

const toBoolean = (value: unknown) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true';
  return false;
};

export const createPostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(160),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  tags: z.preprocess(normalizeTags, z.array(z.string()).max(10)).default([])
});

export const updatePostSchema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(160).optional(),
    content: z.string().min(20, 'Content must be at least 20 characters').optional(),
    tags: z.preprocess(normalizeTags, z.array(z.string()).max(10)).optional(),
    removeImage: z.preprocess(toBoolean, z.boolean()).optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required'
  });
