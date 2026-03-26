import { z } from 'zod';

const toBoolean = (value: unknown) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true';
  return false;
};

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(60),
  bio: z.string().max(250).optional().default(''),
  removeAvatar: z.preprocess(toBoolean, z.boolean()).optional()
});
