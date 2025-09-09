import { RedisClientType, createClient } from 'redis';
import env from '../config/env';
import { logger } from '../garage/log/logger';

export let redisClient: RedisClientType;
let isReady: boolean;

export async function createConnection(): Promise<RedisClientType> {
    if (!isReady) {
        redisClient = createClient({
            url: env.database.redis.url,
        });
        redisClient.on('error', (err: Error) => logger.error(`Redis Error: ${err}`));
        redisClient.on('connect', () => logger.debug('Redis connected'));
        redisClient.on('reconnecting', () => logger.debug('Redis reconnecting'));
        redisClient.on('ready', () => {
            isReady = true;
            logger.debug('Redis ready!');
        });
        await redisClient.connect();
    }
    return redisClient;
}



export async function cacheGet(key: string): Promise<string | null> {
    if (!isReady) await createConnection();
    return redisClient.get(key);
}
  
export async function cacheSet(key: string, value: string, ttlSeconds = 10): Promise<void> {
    if (!isReady) await createConnection();
    await redisClient.set(key, value, { EX: ttlSeconds });
}

export async function cacheDel(key: string): Promise<void> {
    if (!isReady) await createConnection();
    await redisClient.del(key);
}

export async function cacheIncr(key: string): Promise<number> {
    if (!isReady) await createConnection();
    return redisClient.incr(key);
}
  
export async function cacheExpire(key: string, ttlSeconds: number): Promise<void> {
    if (!isReady) await createConnection();
    await redisClient.expire(key, ttlSeconds);
}