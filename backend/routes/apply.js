
import Application from '../models/Application.js';
import mongoose from 'mongoose';
import redis from '../redis/client.js';

export default async function applyRoutes(fastify, options) {
    // Get all applications for the logged-in user
    fastify.get('/applications', async (request, reply) => {
        const userId = request.headers['x-user-id'];

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            // For guest/demo users, we might want to return empty or mock? 
            // Let's return empty for now to encourage login.
            return [];
        }

        try {
            const apps = await Application.find({ userId }).sort({ appliedAt: -1 });
            return apps;
        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: 'Failed to fetch applications' });
        }
    });

    // Create a new application (Track "Applied")
    fastify.post('/applications', async (request, reply) => {
        const userId = request.headers['x-user-id'];
        const { job } = request.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return reply.code(401).send({ error: 'Please login to track applications' });
        }

        try {
            // Check if already applied (MongoDB)
            const exists = await Application.findOne({ userId, 'job.jobId': job.jobId });
            if (exists) {
                return exists; // Idempotent
            }

            // Create in MongoDB
            const application = await Application.create({
                userId,
                job: {
                    jobId: job.jobId,
                    title: job.title,
                    company: job.company,
                    location: job.location,
                    salary: job.salary,
                    url: job.applyUrl || job.url, // Handle different field names
                    description: job.description
                },
                status: 'Applied'
            });

            // --- REDIS TRACKING ---
            const key = `applications:${userId}`;
            try {
                // Get existing list or empty
                const cachedApps = await redis.get(key) || [];
                // Redis might return string if using REST client directly in some modes, but @upstash/redis usually parses JSON.
                // Just in case, ensuring it's an array
                const appsList = Array.isArray(cachedApps) ? cachedApps : [];

                appsList.push({
                    jobId: job.jobId,
                    company: job.company,
                    status: 'Applied',
                    timeline: {
                        appliedAt: Date.now(),
                        interviewAt: null,
                        offerAt: null
                    }
                });

                await redis.set(key, JSON.stringify(appsList));
            } catch (redisErr) {
                console.error('Redis error tracking application:', redisErr);
                // Don't fail the request if Redis updates fail, as MongoDB is the source of truth
            }
            // ----------------------

            return application;
        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: 'Failed to track application' });
        }
    });

    // Update status
    fastify.patch('/applications/:id', async (request, reply) => {
        const userId = request.headers['x-user-id'];
        const { id } = request.params;
        const { status, notes } = request.body;

        try {
            const application = await Application.findOneAndUpdate(
                { _id: id, userId },
                {
                    $set: {
                        ...(status && { status }),
                        ...(notes && { notes }),
                        updatedAt: Date.now()
                    }
                },
                { new: true }
            );

            if (!application) return reply.code(404).send({ error: 'Application not found' });
            return application;
        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: 'Update failed' });
        }
    });
}
