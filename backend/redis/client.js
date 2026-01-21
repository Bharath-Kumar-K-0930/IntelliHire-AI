import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config();

let redis;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
} else {
    console.warn('Redis credentials missing. Using in-memory mock storage.');
    // Simple in-memory mock for local development without Redis
    const storage = new Map();
    redis = {
        get: async (key) => storage.get(key) || null,
        set: async (key, value) => { storage.set(key, value); return 'OK'; },
        del: async (key) => { storage.delete(key); return 1; },
        exists: async (key) => storage.has(key) ? 1 : 0
    };
}

export default redis;
