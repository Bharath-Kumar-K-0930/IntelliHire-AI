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

    // 1. Casual Conversation & Greetings
    if (text.match(/^(hi|hello|hey|greetings|sup)/)) {
        return {
            text: "Hello! I'm IntelliHire AI. I can help you find jobs, track applications, or analyze your resume. Try asking 'Show me React jobs' or 'Check my application status'.",
            action: { type: 'NONE' }
        };
    }
    if (text.includes('how are you')) {
        return {
            text: "I'm doing great! I'm ready to help you land your dream job. What are you looking for today?",
            action: { type: 'NONE' }
        };
    }
    if (text.includes('thank')) {
        return {
            text: "You're welcome! Let me know if you need anything else.",
            action: { type: 'NONE' }
        };
    }
    if (text.includes('help') || text.includes('support')) {
        return {
            text: "I can assist you with:\n- Finding Jobs: 'Remote frontend jobs'\n- Navigation: 'Go to dashboard'\n- Resume: 'Upload resume'\n- Status: 'Check my offers'",
            action: { type: 'NONE' }
        };
    }

    // 2. Navigation Commands
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

    // 3. Job Search Parsing (Enhanced)
    // Trigger if "job", "work", OR explicit skills/locations are mentioned
    const skills = [];
    if (text.includes('react')) skills.push('react');
    if (text.includes('node')) skills.push('node');
    if (text.includes('python')) skills.push('python');
    if (text.includes('java ') || text.includes('java,')) skills.push('java');
    if (text.includes('javascript') || text.includes('js')) skills.push('javascript');
    if (text.includes('design') || text.includes('figma') || text.includes('ui/ux')) skills.push('figma');

    // Check if it's a search intent
    if (text.includes('job') || text.includes('work') || text.includes('opening') || text.includes('role') || skills.length > 0 || text.includes('remote') || text.includes('london') || text.includes('bangalore') || text.includes('india') || text.includes('usa')) {
        const payload = {};
        if (skills.length > 0) payload.skills = skills.join(',');

        // Extract Location
        if (text.includes('remote')) payload.location = 'Remote';
        if (text.includes('london')) payload.location = 'London';
        if (text.includes('bangalore') || text.includes('bengaluru')) payload.location = 'Bangalore';
        if (text.includes('india')) payload.location = 'India';
        if (text.includes('usa') || text.includes('united states')) payload.location = 'USA';

        // Extract Role
        if (text.includes('senior')) payload.role = 'senior';
        if (text.includes('junior')) payload.role = 'junior';
        if (text.includes('frontend')) payload.role = 'frontend';
        if (text.includes('backend')) payload.role = 'backend';
        if (text.includes('full stack') || text.includes('fullstack')) payload.role = 'full stack';
        if (text.includes('designer')) payload.role = 'designer';
        if (text.includes('hr') || text.includes('human resource')) payload.role = 'hr';
        if (text.includes('manager')) payload.role = 'manager';
        if (text.includes('sales')) payload.role = 'sales';

        return {
            text: `I've filtered the job feed for ${payload.role ? payload.role.toUpperCase() + ' ' : ''}roles${payload.location ? ' in ' + payload.location : ''}${skills.length ? ' requiring: ' + skills.join(', ') : ''}. If no jobs appear, please try broadening your search.`,
            action: { type: 'FILTER', payload }
        };
    }

    // 4. Fallback
    return {
        text: "I'm currently running in offline Resilience Mode. I can help with basic queries like 'Show React jobs' or 'Go to dashboard'.",
        action: { type: 'NONE' }
    };
};
