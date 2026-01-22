import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const getGeminiResponse = async (prompt) => {
    if (!process.env.GEMINI_API_KEY) {
        console.error('Error: GEMINI_API_KEY is missing in environment variables.');
        throw new Error('GEMINI_API_KEY missing');
    }

    try {
        // Use the latest standard model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error calling Gemini API:', error.message);
        // Fallback to gemini-pro if flash fails (e.g. region availability)
        if (error.status === 404) {
            console.log('Retrying with gemini-pro...');
            try {
                const fallbackModel = genAI.getGenerativeModel({ model: "gemini-pro" });
                const result = await fallbackModel.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (fallbackError) {
                console.error('Fallback failed:', fallbackError.message);
                throw error;
            }
        }
        throw error;
    }
};

export const parseMatchingResult = (responseText) => {
    try {
        // Regex to find JSON block in case Gemini adds markdown ```json ... ```
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(responseText);
    } catch (error) {
        console.error('Failed to parse AI response:', responseText);
        return { matchScore: 0, strengths: [], missingSkills: [] };
    }
};
