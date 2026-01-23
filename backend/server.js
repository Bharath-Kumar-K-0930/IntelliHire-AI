import dotenv from 'dotenv';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import staticPlugin from '@fastify/static';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import connectDB from './db/connect.js';

import jobRoutes from './routes/jobs.js';
import resumeRoutes from './routes/resume.js';
import matchRoutes from './routes/match.js';
import applyRoutes from './routes/apply.js';
import chatRoutes from './routes/chat.js';
import authRoutes from './routes/auth.js'; // New route
import profileRoutes from './routes/profile.js';

dotenv.config();

// Connect to Database
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
    logger: true
});

// Register Plugins
await fastify.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
});

// Register Routes
fastify.register(authRoutes, { prefix: '/api' });
fastify.register(jobRoutes, { prefix: '/api' });
fastify.register(resumeRoutes, { prefix: '/api' });
fastify.register(matchRoutes, { prefix: '/api' });
fastify.register(applyRoutes, { prefix: '/api' });
fastify.register(chatRoutes, { prefix: '/api' });
fastify.register(profileRoutes, { prefix: '/api' });

// Serve static files if they exist
const publicPath = path.join(__dirname, 'public');
if (fs.existsSync(publicPath)) {
    await fastify.register(staticPlugin, {
        root: publicPath,
        prefix: '/public/',
    });
}

// Basic Health Check & Diagnostics
fastify.get('/health', async (request, reply) => {
    return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: {
            MONGO_URL: process.env.MONGO_URL ? 'PRESENT' : 'MISSING',
            MONGO_URI: process.env.MONGO_URI ? 'PRESENT' : 'MISSING',
            GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'PRESENT' : 'MISSING',
            RAPIDAPI_KEY: process.env.RAPIDAPI_KEY ? 'PRESENT' : 'MISSING',
            RAPIDAPI_HOST: process.env.RAPIDAPI_HOST ? 'PRESENT' : 'MISSING',
            PORT: process.env.PORT || 'Default (5000)'
        },
        database: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED (State: ' + mongoose.connection.readyState + ')'
    };
});

// Start Server
const start = async () => {
    try {
        const port = process.env.PORT || 5000;
        await fastify.listen({ port, host: '0.0.0.0' });
        console.log(`Server listening on http://localhost:${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
