import multipart from '@fastify/multipart';
import { extractTextFromFile, extractProfileData } from '../utils/parser.js';
import redis from '../redis/client.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function resumeRoutes(fastify, options) {
    fastify.register(multipart, { attachFieldsToBody: true });

    fastify.post('/resume/upload', async (request, reply) => {
        if (!request.body || !request.body.resume) {
            return reply.code(400).send({ error: 'No resume file uploaded' });
        }
        const data = request.body.resume; // remove await
        const userId = request.headers['x-user-id'] || 'default-user';

        if (!data) return reply.code(400).send({ error: 'No resume uploaded' });
        // Handle if it's an array (multiple files with same name?)
        const filePart = Array.isArray(data) ? data[0] : data;

        // Save temp file
        const tempPath = path.join(__dirname, `../temp_${userId}_${filePart.filename}`);
        await fs.promises.writeFile(tempPath, await filePart.toBuffer());

        try {
            console.log('Starting extraction for:', tempPath, filePart.mimetype);
            const text = await extractTextFromFile({ path: tempPath, mimetype: filePart.mimetype });
            console.log('Text extracted length:', text?.length);

            console.log('Starting profile AI extraction...');
            const profileData = await extractProfileData(text);
            console.log('Profile extracted:', profileData ? 'Yes' : 'No');

            // Store in Redis (Fast access for matching)
            await redis.set(`resume:${userId}`, text);

            // Store in MongoDB User Profile if authenticated
            if (mongoose.Types.ObjectId.isValid(userId)) {
                const updateData = {
                    resumeText: text,
                    profile: profileData
                };

                // Also update user name if extracted from resume
                if (profileData && profileData.name) {
                    updateData.name = profileData.name;
                }

                await User.findByIdAndUpdate(userId, updateData);
                console.log(`Updated profile for user ${userId}`, {
                    hasName: !!profileData?.name,
                    hasSkills: !!profileData?.skills?.length,
                    hasExperience: !!profileData?.experience?.length,
                    hasEducation: !!profileData?.education?.length,
                    hasProjects: !!profileData?.projects?.length,
                    hasInternships: !!profileData?.internships?.length,
                    hasCertifications: !!profileData?.certifications?.length,
                    hasLanguages: !!profileData?.languages?.length,
                    hasHobbies: !!profileData?.hobbies?.length
                });
            }

            return { message: 'Resume uploaded and processed successfully' };
        } catch (error) {
            const errorLog = `[${new Date().toISOString()}] Error: ${error.message}\nStack: ${error.stack}\n\n`;
            await fs.promises.appendFile(path.join(__dirname, '../backend_errors.txt'), errorLog);
            console.error('Resume Processing Error:', error);
            return reply.code(500).send({ error: `Processing error: ${error.message}` });
        } finally {
            // Cleanup
            try {
                await fs.promises.unlink(tempPath);
            } catch (ignore) { }
        }
    });

    fastify.get('/resume', async (request, reply) => {
        const userId = request.headers['x-user-id'] || 'default-user';
        let text = await redis.get(`resume:${userId}`);
        let profile = null;

        // If not in Redis but valid User ID, fetch from DB and cache it
        if (mongoose.Types.ObjectId.isValid(userId)) {
            const user = await User.findById(userId);
            if (user) {
                if (!text && user.resumeText) {
                    text = user.resumeText;
                    await redis.set(`resume:${userId}`, text);
                }
                profile = user.profile;
            }
        }

        return { resumeText: text || '', profile };
    });
}
