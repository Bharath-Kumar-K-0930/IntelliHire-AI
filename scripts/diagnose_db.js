import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend folder
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

const applicationSchema = new mongoose.Schema({}, { strict: false });
const Application = mongoose.model('Application', applicationSchema);

const run = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const email = 'ravanasur9192@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User ${email} NOT FOUND.`);
            return;
        }

        console.log(`User Found: ${user.name} (${user._id})`);

        const apps = await Application.find({ userId: user._id });
        console.log(`Found ${apps.length} applications.`);

        apps.forEach((app, i) => {
            console.log(`[${i + 1}] ID: ${app._id} | Status: ${app.status} | JobID: ${app.job?.jobId}`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Done.');
    }
};

run();
