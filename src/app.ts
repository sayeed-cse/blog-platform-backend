import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import bookmarkRoutes from './routes/bookmark.routes';
import commentRoutes from './routes/comment.routes';
import postRoutes from './routes/post.routes';
import userRoutes from './routes/user.routes';
import { env } from './config/env';
import { errorHandler, notFound } from './middlewares/error.middleware';

export const app = express();

const allowedOrigins = [
  env.clientUrl,
  'http://localhost:3000',
  'https://blog-platform-frontend-umber.vercel.app',
  'https://blog-platform-frontend-git-main-abdullah-sayeeds-projects.vercel.app'
].filter(Boolean);

const previewPattern =
  /^https:\/\/blog-platform-frontend-[a-z0-9-]+-abdullah-sayeeds-projects\.vercel\.app$/;

app.use(helmet({ crossOriginResourcePolicy: false }));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin) || previewPattern.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Blog API is running',
    health: '/api/health'
  });
});

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