import env from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { createApp } from './app.js';

/**
 * Server entry point: connects to the database, starts listening and
 * handles graceful shutdown.
 */
async function start() {
  await connectDatabase();

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });

  // Stop accepting connections, close the database, then exit.
  const shutdown = (signal) => {
    console.log(`${signal} received. Shutting down.`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    // Force exit if open connections keep the server alive.
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

start().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
