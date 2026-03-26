import { Router } from 'express';
import {
  createPost,
  deletePost,
  getMyPosts,
  getPosts,
  getSinglePost,
  updatePost
} from '../controllers/post.controller';
import { protect } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.get('/', getPosts);
router.get('/me', protect, getMyPosts);
router.get('/:id', getSinglePost);
router.post('/', protect, upload.single('image'), createPost);
router.patch('/:id', protect, upload.single('image'), updatePost);
router.delete('/:id', protect, deletePost);

export default router;
