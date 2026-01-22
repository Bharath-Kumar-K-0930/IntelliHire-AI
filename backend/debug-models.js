
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const testDirect = async () => {
    const key = process.env.GEMINI_API_KEY;
    console.log("Checking API Key availability...");

    if (!key) {
        console.error("Missing GEMINI_API_KEY");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    console.log(`Fetching models list from: ${url.replace(key, 'HIDDEN_KEY')} ...`);

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.models) {
            console.log("\n✅ API Connection Successful! Available Models:");
            data.models.forEach(m => console.log(` - ${m.name} (${m.supportedGenerationMethods})`));
        } else {
            console.error("\n❌ API Error:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("\n❌ Network Error:", e.message);
    }
};

testDirect();
