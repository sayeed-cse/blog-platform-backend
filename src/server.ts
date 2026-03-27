import { app } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

let dbPromise: Promise<unknown> | null = null;

const ensureDB = async () => {
  if (!dbPromise) {
    dbPromise = connectDB();
  }
  await dbPromise;
};

if (!process.env.VERCEL) {
  const startServer = async () => {
    try {
      await ensureDB();

      app.listen(env.port, () => {
        console.log(`Server listening on http://localhost:${env.port}`);
        console.log('Booting app', {
          nodeEnv: env.nodeEnv,
          hasMongoUri: Boolean(env.mongodbUri),
          clientUrl: env.clientUrl,
          port: env.port
        });
      });
    } catch (error) {
      console.error('Failed to start server', error);
      process.exit(1);
    }
  };

  startServer();
}

export default async function handler(req: any, res: any) {
  await ensureDB();
  return app(req, res);
}