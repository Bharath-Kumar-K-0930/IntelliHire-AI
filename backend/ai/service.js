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

            // DEBUG LOGGING
            if (!data.candidates) {
                console.log(`[Gemini Debug] No candidates from ${model}. Feedback:`, data.promptFeedback);
            }

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

export const getRuleBasedResponse = (message) => {
    const text = message.toLowerCase();

    // 1. Navigation Commands
    if (text.includes('resume') || text.includes('upload')) {
        return {
            text: "Navigating to Resume Upload page.",
            action: { type: 'NAVIGATE', payload: { path: '/resume' } }
        };
    }
    if (text.includes('application') || text.includes('status') || text.includes('dashboard')) {
        return {
            text: "Here is your Applications Dashboard.",
            action: { type: 'NAVIGATE', payload: { path: '/applications' } }
        };
    }

    // 2. Job Search Commands
    if (text.includes('job') || text.includes('work') || text.includes('opening') || text.includes('role')) {
        const payload = {};

        // Extract Skills
        const skills = [];
        if (text.includes('react')) skills.push('react');
        if (text.includes('node')) skills.push('node');
        if (text.includes('python')) skills.push('python');
        if (text.includes('design') || text.includes('figma')) skills.push('figma');
        if (skills.length > 0) payload.skills = skills.join(',');

        // Extract Location
        if (text.includes('remote')) payload.location = 'Remote';
        if (text.includes('london')) payload.location = 'London';
        if (text.includes('bangalore') || text.includes('bengaluru')) payload.location = 'Bangalore';

        // Extract Role
        if (text.includes('senior')) payload.role = 'senior';
        if (text.includes('junior')) payload.role = 'junior';
        if (text.includes('frontend')) payload.role = 'frontend';
        if (text.includes('backend')) payload.role = 'backend';

        return {
            text: `Sure! Searching for ${payload.role || ''} jobs ${payload.location ? 'in ' + payload.location : ''} ${skills.length ? 'combining ' + skills.join(', ') : ''}.`,
            action: { type: 'FILTER', payload }
        };
    }

    // 3. Fallback / Help
    return {
        text: "I'm currently running in offline mode. I can help you find jobs (try 'remote react jobs') or navigate the site (try 'go to dashboard').",
        action: { type: 'NONE' }
    };
};
