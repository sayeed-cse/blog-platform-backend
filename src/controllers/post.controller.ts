import { Request, Response } from 'express';
import { Bookmark } from '../models/bookmark.model';
import { Comment } from '../models/comment.model';
import { Post } from '../models/post.model';
import { ApiError } from '../utils/api-error';
import { asyncHandler } from '../utils/async-handler';
import { uploadImageBuffer, deleteCloudinaryImageByPublicId } from '../utils/cloudinary';
import { deleteLocalFileIfExists } from '../utils/file';
import { createPostSchema, updatePostSchema } from '../validations/post.schema';

const removePostImage = async (image?: string | null, publicId?: string | null) => {
  if (publicId) {
    await deleteCloudinaryImageByPublicId(publicId);
  }
  deleteLocalFileIfExists(image);
};

export const getPosts = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(20, Math.max(1, Number(req.query.limit || 10)));
  const skip = (page - 1) * limit;
  const search = String(req.query.search || '').trim();

  const query = search
    ? {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { tags: { $elemMatch: { $regex: search, $options: 'i' } } }
        ]
      }
    : {};

  const [items, total] = await Promise.all([
    Post.find(query)
      .populate('author', 'name email avatar bio')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    data: items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

export const getMyPosts = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized');
  }

  const items = await Post.find({ author: req.user._id })
    .populate('author', 'name email avatar bio')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: items
  });
});

export const getSinglePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findById(req.params.id).populate('author', 'name email avatar bio');

  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  res.status(200).json({
    success: true,
    data: post
  });
});

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized');
  }

  const payload = createPostSchema.parse(req.body);
  let image = '';
  let imagePublicId = '';

  if (req.file?.buffer) {
    const uploaded = await uploadImageBuffer(req.file.buffer, 'blog-platform/posts');
    image = uploaded.secure_url;
    imagePublicId = uploaded.public_id;
  }

  const post = await Post.create({
    author: req.user._id,
    title: payload.title,
    content: payload.content,
    tags: payload.tags,
    image,
    imagePublicId
  });

  const populated = await post.populate('author', 'name email avatar bio');

  res.status(201).json({
    success: true,
    message: 'Post created successfully',
    data: populated
  });
});

export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized');
  }

  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  if (String(post.author) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only update your own posts');
  }

  const payload = updatePostSchema.parse(req.body);

  if (typeof payload.title !== 'undefined') post.title = payload.title;
  if (typeof payload.content !== 'undefined') post.content = payload.content;
  if (typeof payload.tags !== 'undefined') post.tags = payload.tags;

  if (req.file?.buffer) {
    await removePostImage(post.image, post.imagePublicId);
    const uploaded = await uploadImageBuffer(req.file.buffer, 'blog-platform/posts');
    post.image = uploaded.secure_url;
    post.imagePublicId = uploaded.public_id;
  } else if (payload.removeImage) {
    await removePostImage(post.image, post.imagePublicId);
    post.image = '';
    post.imagePublicId = '';
  }

  await post.save();
  const populated = await post.populate('author', 'name email avatar bio');

  res.status(200).json({
    success: true,
    message: 'Post updated successfully',
    data: populated
  });
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized');
  }

  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  if (String(post.author) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only delete your own posts');
  }

  await removePostImage(post.image, post.imagePublicId);

  await Promise.all([
    Post.findByIdAndDelete(post._id),
    Comment.deleteMany({ post: post._id }),
    Bookmark.deleteMany({ post: post._id })
  ]);

  res.status(200).json({
    success: true,
    message: 'Post deleted successfully'
  });
});
