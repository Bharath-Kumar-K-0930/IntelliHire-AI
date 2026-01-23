
import Application from '../models/Application.js';
import mongoose from 'mongoose';
import redis from '../redis/client.js';

export default async function applyRoutes(fastify, options) {
    // Get all applications for the logged-in user
    fastify.get('/applications', async (request, reply) => {
        const userId = request.headers['x-user-id'];

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return [];
        }

        try {
            // 1. Try fetching from Redis first (Speed)
            const key = `applications:${userId}`;
            const cachedApps = await redis.get(key);

            if (cachedApps) {
                let appsList = [];
                if (Array.isArray(cachedApps)) appsList = cachedApps;
                else if (typeof cachedApps === 'string') {
                    try { appsList = JSON.parse(cachedApps); } catch (e) { }
                }

                if (Array.isArray(appsList) && appsList.length > 0) {
                    return appsList;
                }
            }

            // 2. Fallback to MongoDB (Reliability)
            const apps = await Application.find({ userId }).sort({ appliedAt: -1 });

            // Optional: Populate Redis if empty?
            if (apps.length > 0) {
                // We could cache relevant fields similar to POST structure
                // But let's keep it simple for now or strictly follow the POST structure
            }

            return apps;
        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: 'Failed to fetch applications' });
        }
    });

    // Create a new application (Track "Applied")
    fastify.post('/applications', async (request, reply) => {
        const userId = request.headers['x-user-id'];
        const body = request.body;
        const { job } = body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return reply.code(401).send({ error: 'Please login to track applications' });
        }

        if (!job) {
            return reply.code(400).send({ error: 'No job data provided' });
        }

        // Robust ID extraction
        const safeJobId = job.jobId || job.job_id || job.id;

        if (!safeJobId) {
            console.log('Missing Job ID in payload:', job);
            return reply.code(400).send({ error: 'Invalid job data: Missing Job ID' });
        }

        try {
            // Check if already applied (MongoDB)
            const exists = await Application.findOne({ userId, 'job.jobId': safeJobId });
            if (exists) {
                return exists; // Idempotent
            }

            // Create in MongoDB
            const application = await Application.create({
                userId,
                job: {
                    jobId: safeJobId,
                    title: job.title || job.job_title || 'Unknown Role',
                    company: job.company || job.employer_name || 'Unknown Company',
                    location: job.location || job.job_city || 'Remote',
                    salary: job.salary,
                    url: job.applyUrl || job.url || job.job_apply_link,
                    description: job.description
                },
                status: 'Applied'
            });

            // --- REDIS TRACKING ---
            const key = `applications:${userId}`;
            try {
                // Get existing list or empty
                const cachedApps = await redis.get(key);
                let appsList = [];

                if (cachedApps) {
                    if (Array.isArray(cachedApps)) {
                        appsList = cachedApps;
                    } else if (typeof cachedApps === 'object') {
                        // Sometimes Redis returns a single object if previously stored incorrectly
                        appsList = [cachedApps];
                    } else if (typeof cachedApps === 'string') {
                        try {
                            const parsed = JSON.parse(cachedApps);
                            if (Array.isArray(parsed)) {
                                appsList = parsed;
                            } else if (parsed && typeof parsed === 'object') {
                                appsList = [parsed];
                            }
                        } catch (e) {
                            console.warn('Failed to parse Redis applications list', e);
                            appsList = [];
                        }
                    }
                }

                // Ensure it is truly an array before pushing
                if (!Array.isArray(appsList)) appsList = [];

                // Check for duplicates in Redis list to avoid error
                const isRedisDuplicate = appsList.some(app => app.job?.jobId === safeJobId || app.jobId === safeJobId);

                if (!isRedisDuplicate) {
                    // Match MongoDB Schema Structure for Frontend Compatibility
                    const newAppEntry = {
                        _id: new mongoose.Types.ObjectId().toString(), // Fake ID for keying
                        userId,
                        job: {
                            jobId: safeJobId,
                            title: job.title || job.job_title || 'Unknown Role',
                            company: job.company || job.employer_name || 'Unknown Company',
                            location: job.location || job.job_city || 'Remote',
                            salary: job.salary,
                            url: job.applyUrl || job.url || job.job_apply_link,
                            description: job.description
                        },
                        status: 'Applied',
                        appliedAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };

                    appsList.push(newAppEntry);
                    await redis.set(key, JSON.stringify(appsList));
                }
            } catch (redisErr) {
                console.error('Redis error tracking application:', redisErr);
                // Don't fail the request if Redis updates fail, as MongoDB is the source of truth
            }
            // ----------------------

            return application;
        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: 'Failed to track application', details: error.message });
        }
    });

    // Update status
    fastify.patch('/applications/:id', async (request, reply) => {
        const userId = request.headers['x-user-id'];
        const { id } = request.params;
        const { status, notes } = request.body;

        try {
            // Flexible Lookup: Try by _id OR by internal jobId (JSearch ID)
            const conditions = [{ 'job.jobId': id }];

            if (mongoose.Types.ObjectId.isValid(id)) {
                conditions.push({ _id: id });
            }

            const application = await Application.findOne({
                userId,
                $or: conditions
            });

            if (!application) {
                return reply.code(404).send({ error: 'Application not found', id });
            }

            // Perform Update
            application = await Application.findByIdAndUpdate(
                application._id,
                {
                    $set: {
                        ...(status && { status }),
                        ...(notes && { notes }),
                        updatedAt: Date.now()
                    }
                },
                { new: true }
            );

            // Sync with Redis to prevent stale data
            const key = `applications:${userId}`;
            try {
                const cachedApps = await redis.get(key);
                if (cachedApps) {
                    let appsList = [];
                    try {
                        appsList = JSON.parse(cachedApps);
                        if (!Array.isArray(appsList)) appsList = [];
                    } catch (e) { appsList = []; }

                    // Find and update the specific application in the list
                    const updatedList = appsList.map(app => {
                        // Check matching ID (handle potential string vs ObjectId discrepancies)
                        if (app._id === id || app.job?.jobId === application.job?.jobId) {
                            return {
                                ...app,
                                status: status || app.status,
                                notes: notes || app.notes,
                                updatedAt: new Date().toISOString()
                            };
                        }
                        return app;
                    });

                    await redis.set(key, JSON.stringify(updatedList));
                }
            } catch (redisErr) {
                console.error('Failed to sync Redis on update:', redisErr);
            }

            return application;
        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: 'Update failed' });
        }
    });
}
