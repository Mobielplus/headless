// app/lib/redis.server.ts
import { createClient } from 'redis';

let redis: ReturnType<typeof createClient>;

declare global {
  var __redis: any;
}

// This ensures we reuse the connection in development
if (process.env.NODE_ENV === 'production') {
  redis = createClient({
    url: process.env.REDIS_URL
  });
  redis.connect().catch((err: Error) => {
    console.error('Redis connection error:', err);
  });
} else {
  if (!global.__redis) {
    global.__redis = createClient({
      url: process.env.REDIS_URL
    });
    global.__redis.connect().catch((err: Error) => {
      console.error('Redis connection error:', err);
    });
  }
  redis = global.__redis;
}

// If you want to add an error event handler, use proper typing
redis.on('error', (err: Error) => {
  console.error('Redis client error:', err);
});

export { redis };