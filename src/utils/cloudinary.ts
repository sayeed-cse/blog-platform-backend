import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { env, hasCloudinaryConfig } from '../config/env';
import { ApiError } from './api-error';

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    secure: true
  });
}

const ensureCloudinary = () => {
  if (!hasCloudinaryConfig) {
    throw new ApiError(
      500,
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
    );
  }
};

export const uploadImageBuffer = async (
  fileBuffer: Buffer,
  folder: string
): Promise<Pick<UploadApiResponse, 'secure_url' | 'public_id'>> => {
  ensureCloudinary();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image'
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload failed'));
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id
        });
      }
    );

    stream.end(fileBuffer);
  });
};

export const deleteCloudinaryImageByPublicId = async (publicId?: string | null) => {
  if (!publicId || !hasCloudinaryConfig) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
};
