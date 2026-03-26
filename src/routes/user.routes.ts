import { Router } from 'express';
import { updateProfile } from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.patch('/profile', protect, upload.single('avatar'), updateProfile);

export default router;
