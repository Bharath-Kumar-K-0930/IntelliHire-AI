import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export default async function profileRoutes(fastify, options) {
    // Update user profile
    fastify.post('/profile/update', async (request, reply) => {
        const userId = request.headers['x-user-id'];
        const { profile } = request.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return reply.code(401).send({ error: 'Please login to update profile' });
        }

        try {
            await User.findByIdAndUpdate(userId, {
                profile: profile,
                name: profile.name
            });
            return { message: 'Profile updated successfully' };
        } catch (error) {
            console.error('Profile update error:', error);
            return reply.code(500).send({ error: 'Failed to update profile' });
        }
    });

    // Change password
    fastify.post('/auth/change-password', async (request, reply) => {
        const userId = request.headers['x-user-id'];
        const { currentPassword, newPassword } = request.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return reply.code(401).send({ error: 'Please login to change password' });
        }

        try {
            const user = await User.findById(userId);
            if (!user) {
                return reply.code(404).send({ error: 'User not found' });
            }

            // Verify current password
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return reply.code(400).send({ error: 'Current password is incorrect' });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            await user.save();

            return { message: 'Password changed successfully' };
        } catch (error) {
            console.error('Password change error:', error);
            return reply.code(500).send({ error: 'Failed to change password' });
        }
    });
}
