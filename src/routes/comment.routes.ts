import { Router } from 'express';
import {
  createComment,
  deleteComment,
  getCommentsByPost,
  updateComment
} from '../controllers/comment.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.get('/post/:postId', getCommentsByPost);
router.post('/', protect, createComment);
router.patch('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);

export default router;
