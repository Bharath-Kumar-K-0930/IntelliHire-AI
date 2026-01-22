import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

export const getGeminiResponse = async (prompt) => {
    if (!API_KEY) {
        console.error('Error: GEMINI_API_KEY is missing.');
        throw new Error('GEMINI_API_KEY missing');
    }

    // Direct REST API call to bypass SDK model resolution issues
    // Using gemini-1.5-flash which we verified exists via REST API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Gemini API Error:', JSON.stringify(errorData, null, 2));
            throw new Error(`Gemini API Failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.candidates || data.candidates.length === 0) {
            console.warn('Gemini returned no candidates.');
            return "I couldn't generate a response. Please try again.";
        }

        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Error calling Gemini API (REST):', error.message);
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
