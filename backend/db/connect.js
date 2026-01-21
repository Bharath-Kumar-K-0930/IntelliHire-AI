import mongoose from 'mongoose';

const connectDB = async () => {
    const MAX_RETRIES = 5;
    let retries = 0;

    if (!process.env.MONGO_URL) {
        console.error('FATAL ERROR: MONGO_URL environment variable is MISSING or UNDEFINED in Render dashboard.');
        console.log('Available Env Keys:', Object.keys(process.env).join(', '));
        return; // Don't crash immediately, allow health check to serve diagnostics
    }

    while (retries < MAX_RETRIES) {
        try {
            const conn = await mongoose.connect(process.env.MONGO_URL, {
                serverSelectionTimeoutMS: 30000,
            });
            console.log(`MongoDB Connected: ${conn.connection.host}`);
            return;
        } catch (error) {
            retries++;
            console.error(`MongoDB Connection Error (Attempt ${retries}/${MAX_RETRIES}): ${error.message}`);
            if (retries >= MAX_RETRIES) {
                console.error('Max retries reached for MongoDB connection.');
                // In production, we might want to exit, but for debugging keep it alive
            }
            await new Promise(res => setTimeout(res, 5000));
        }
    }
};

export default connectDB;
