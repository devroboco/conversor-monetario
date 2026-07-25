import { Redis } from 'ioredis';
import envConfig from './env.js'; 

const redisClient = new Redis({
  host: envConfig.REDIS_HOST,
  port: envConfig.REDIS_PORT,
  maxRetriesPerRequest: 1,
  lazyConnect: true,
  retryStrategy(times: number) {
    if (times > 3) return null;
    return Math.min(times * 100, 2000);
  },
});

redisClient.on('error', (err: Error) => {
  console.warn('[Redis Warning] Falha na conexão com o Redis:', err.message);
});

redisClient.on('connect', () => {
  console.log('Redis conectado com sucesso');
});

export default redisClient;