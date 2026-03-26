import { app } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

const startServer = async () => {
  try {
    // await connectDB();
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
