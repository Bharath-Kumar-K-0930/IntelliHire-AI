import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config();

let redis;

const createMockRedis = () => {
    console.warn('Using in-memory mock storage (either credentials missing or connection failed).');
    const storage = new Map();
    return {
        get: async (key) => storage.get(key) || null,
        set: async (key, value) => { storage.set(key, value); return 'OK'; },
        del: async (key) => { storage.delete(key); return 1; },
        exists: async (key) => storage.has(key) ? 1 : 0
    };
};

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
        const url = process.env.UPSTASH_REDIS_REST_URL.replace(/["']/g, '');
        const token = process.env.UPSTASH_REDIS_REST_TOKEN.replace(/["']/g, '');

        redis = new Redis({
            url: url,
            token: token,
        });

        // Wrap all methods with a try-catch to handle network failures at runtime
        const originalGet = redis.get.bind(redis);
        const originalSet = redis.set.bind(redis);

        redis.get = async (...args) => {
            try {
                return await originalGet(...args);
            } catch (err) {
                console.error('Redis Get Error (falling back to mock):', err.message);
                return null;
            }
        };

        redis.set = async (...args) => {
            try {
                return await originalSet(...args);
            } catch (err) {
                console.error('Redis Set Error:', err.message);
                return 'ERROR';
            }
        };

    } catch (err) {
        console.error('Redis connection initialization failed:', err.message);
        redis = createMockRedis();
    }
} else {
    redis = createMockRedis();
}

export default redis;
