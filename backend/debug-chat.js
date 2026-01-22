
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const testChat = async () => {
    const key = process.env.GEMINI_API_KEY;
    console.log("API Key Status:", key ? `Present (Length: ${key.length})` : "MISSING");

    if (!key) {
        console.error("ERROR: No API Key found in .env");
        return;
    }

    const genAI = new GoogleGenerativeAI(key);
    // List of potential models to try
    const models = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro", "models/gemini-1.5-flash"];

    for (const modelName of models) {
        console.log(`\nTesting Model: "${modelName}"...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello via debug script");
            const response = await result.response;
            console.log(`✅ SUCCESS with "${modelName}"! Response: ${response.text()}`);
            return; // Exit on first success
        } catch (e) {
            console.error(`❌ FAILED (${modelName}):`, e.message.split('\n')[0]); // Log first line of error
        }
    }
    console.log("\nAll models failed.");
};

testChat();
