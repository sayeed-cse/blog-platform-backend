import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import authRoutes from './routes/auth.routes';
import bookmarkRoutes from './routes/bookmark.routes';
import commentRoutes from './routes/comment.routes';
import postRoutes from './routes/post.routes';
import userRoutes from './routes/user.routes';
import { env } from './config/env';
import { errorHandler, notFound } from './middlewares/error.middleware';

export const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

app.use(notFound);
app.use(errorHandler);
