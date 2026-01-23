import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

export const getGeminiResponse = async (prompt) => {
    if (!API_KEY) {
        console.error('Error: GEMINI_API_KEY is missing.');
        throw new Error('GEMINI_API_KEY missing');
    }

    // List of models to try in order of preference
    // Supports fallback if 'flash' is 404/unavailable in region
    const models = ['gemini-1.5-flash', 'gemini-pro', 'gemini-1.5-pro-latest'];

    for (const model of models) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.warn(`Gemini API Error (${model}):`, JSON.stringify(errorData));
                continue; // Try next model
            }

            const data = await response.json();
            if (!data.candidates || data.candidates.length === 0) continue;

            return data.candidates[0].content.parts[0].text;
        } catch (e) {
            console.warn(`Network Error (${model}):`, e.message);
        }
    }

    console.error("All Gemini models failed to respond.");
    throw new Error('All Gemini models failed.');
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
