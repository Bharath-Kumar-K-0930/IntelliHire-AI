
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import redis from '../redis/client.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d'
    });
};

export default async function authRoutes(fastify, options) {
    // Middleware to check DB connection for auth routes
    fastify.addHook('preHandler', async (request, reply) => {
        if (mongoose.connection.readyState !== 1) {
            return reply.code(503).send({
                error: 'Database not connected. Please ensure MONGO_URL is set correctly in Render dashboard settings (Environment tab).'
            });
        }
    });

    fastify.post('/auth/register', async (request, reply) => {
        const { name, email, password } = request.body;

        try {
            const userExists = await User.findOne({ email });

            if (userExists) {
                return reply.code(400).send({ error: 'User already exists' });
            }

            const user = await User.create({
                name,
                email,
                password
            });

            if (user) {
                return {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    token: generateToken(user._id)
                };
            } else {
                return reply.code(400).send({ error: 'Invalid user data' });
            }
        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: 'Server error' });
        }
    });

    fastify.post('/auth/login', async (request, reply) => {
        const { email, password } = request.body;

        try {
            const user = await User.findOne({ email });

            if (user && (await user.matchPassword(password))) {
                return {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    token: generateToken(user._id),
                    profile: user.profile
                };

                // Store session in Redis
                try {
                    await redis.set(`session:${user._id}`, JSON.stringify({
                        email: user.email,
                        createdAt: Date.now(),
                        lastActive: Date.now()
                    }), { ex: 60 * 60 * 24 }); // 24 hours
                } catch (err) {
                    console.error('Redis Error (Session):', err);
                }

                return responseData;
            } else {
                return reply.code(401).send({ error: 'Invalid email or password' });
            }
        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: 'Server error' });
        }
    });

    // Placeholder for Google Auth (Backend handling)
    // Normally validating the token sent from frontend:
    fastify.post('/auth/google', async (request, reply) => {
        const { token, user: googleUser } = request.body;
        // In a real app, verify the Google token here. 
        // For this demo, we trust the frontend sent correct info (or mock it).

        try {
            let user = await User.findOne({ email: googleUser.email });

            if (!user) {
                // Create new user
                user = await User.create({
                    name: googleUser.name,
                    email: googleUser.email,
                    googleId: googleUser.sub, // or id
                    password: '' // Not needed
                });
            }

            return {
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
                profile: user.profile
            };

        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: 'Google Auth Failed' });
        }
    });
}
