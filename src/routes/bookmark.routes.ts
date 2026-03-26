import { Router } from 'express';
import {
  addBookmark,
  getBookmarks,
  removeBookmark
} from '../controllers/bookmark.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);
router.get('/', getBookmarks);
router.post('/:postId', addBookmark);
router.delete('/:postId', removeBookmark);

export default router;
