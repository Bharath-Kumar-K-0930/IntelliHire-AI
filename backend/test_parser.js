
import { extractTextFromFile, extractProfileData } from './utils/parser.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const run = async () => {
    // Pick an existing temp file
    const file = {
        path: path.join(__dirname, 'temp_69710ace585a4cef322c2aee_AI_intern_resume.pdf'),
        mimetype: 'application/pdf'
    };

    console.log('Testing extraction on:', file.path);
    try {
        const text = await extractTextFromFile(file);
        console.log('Text extracted. Length:', text.length);
        console.log('Snippet:', text.substring(0, 100));

        console.log('Testing Profile Extraction (Gemini)...');
        const profile = await extractProfileData(text);
        console.log('Profile Extracted:', JSON.stringify(profile, null, 2));

    } catch (error) {
        console.error('Test Failed:', error);
    }
};

run();
