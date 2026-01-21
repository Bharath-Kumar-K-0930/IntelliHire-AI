
const STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'to', 'for', 'of', 'in', 'on', 'at', 'with', 'by',
    'work', 'job', 'position', 'experience', 'skills', 'required', 'preferred', 'looking', 'hiring', 'team', 'company',
    'will', 'be', 'as', 'role', 'responsibilities', 'qualifications', 'we', 'you', 'your', 'our', 'this', 'that', 'it'
]);

const TECH_KEYWORDS = new Set([
    'react', 'node', 'javascript', 'typescript', 'python', 'java', 'html', 'css', 'sql', 'nosql', 'mongodb', 'docker',
    'kubernetes', 'aws', 'azure', 'gcp', 'git', 'agile', 'scrum', 'backend', 'frontend', 'fullstack', 'api', 'rest',
    'graphql', 'redux', 'context', 'hooks', 'express', 'fastify', 'flask', 'django', 'marketing', 'seo', 'sales',
    'management', 'leadership', 'communication', 'design', 'figma', 'adobe', 'ui', 'ux', 'analysis', 'data', 'finance'
]);

function normalize(text) {
    if (!text) return [];
    return text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

function extractSkills(tokens) {
    return tokens.filter(t => TECH_KEYWORDS.has(t) || t.length > 5); // Simple heuristic: known tech or long words (potential simpler approach)
}

export const scoreJob = (resumeText, job) => {
    if (!resumeText) return { score: 0, reason: 'Upload resume to see match score' };

    const resumeTokens = new Set(normalize(resumeText));
    const jobTokens = new Set(normalize(job.description + ' ' + job.title));

    let matchCount = 0;
    const matchedSkills = [];

    // Prioritize Tech Keywords
    for (const token of jobTokens) {
        if (resumeTokens.has(token)) {
            matchCount++;
            if (TECH_KEYWORDS.has(token)) {
                matchCount += 2; // Bonus for known tech skills
                if (matchedSkills.length < 5) matchedSkills.push(token);
            } else if (matchedSkills.length < 5 && matchCount % 3 === 0) {
                // matchedSkills.push(token); // Maybe too noisy
            }
        }
    }

    // Similarity Score Calculation (Jaccard-ish but weighted)
    // We want a score relative to the job's requirements (jobTokens size)
    // But job descriptions can be long. Let's cap the denominator or focus on key terms.

    // Better approach: Percentage of job's "important" words found in resume.
    const jobArray = Array.from(jobTokens);
    const importantJobWords = jobArray.filter(w => TECH_KEYWORDS.has(w) || w.length > 6);

    let weightedMatches = 0;
    importantJobWords.forEach(w => {
        if (resumeTokens.has(w)) weightedMatches++;
    });

    let rawScore = 0;
    if (importantJobWords.length > 0) {
        rawScore = (weightedMatches / importantJobWords.length) * 100;
    } else {
        // Fallback if no important words found (generic job)
        rawScore = (matchCount / jobTokens.size) * 100 * 3; // Boost ratio
    }

    // Normalize score 0-95 (leave 100 for perfect)
    let finalScore = Math.min(Math.round(rawScore + 10), 98); // Base boost
    if (finalScore < 10) finalScore = 15; // Minimum morale boost

    let reason = "Contextual match based on profile.";
    if (matchedSkills.length > 0) {
        reason = `Matches your skills in: ${matchedSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}`;
    } else if (finalScore > 50) {
        reason = "Strong alignment with job description keywords.";
    }

    return {
        score: finalScore,
        reason: reason
    };
};
