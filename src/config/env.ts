import dotenv from 'dotenv';

dotenv.config();

const required = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
};

const optional = (name: string) => process.env[name] || '';

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  mongodbUri: required('MONGODB_URI'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieExpiresDays: Number(process.env.COOKIE_EXPIRES_DAYS || 7),
  cloudinaryCloudName: optional('CLOUDINARY_CLOUD_NAME'),
  cloudinaryApiKey: optional('CLOUDINARY_API_KEY'),
  cloudinaryApiSecret: optional('CLOUDINARY_API_SECRET')
};

export const hasCloudinaryConfig =
  Boolean(env.cloudinaryCloudName) &&
  Boolean(env.cloudinaryApiKey) &&
  Boolean(env.cloudinaryApiSecret);
