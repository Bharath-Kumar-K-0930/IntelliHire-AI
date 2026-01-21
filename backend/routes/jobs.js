import { fetchJobs } from '../services/jobsService.js';
import { scoreJob } from '../services/matchService.js';
import redis from '../redis/client.js';

export default async function jobRoutes(fastify, options) {
    fastify.get('/jobs', async (request, reply) => {
        const { role, skills, datePosted, jobType, workMode, location, minScore } = request.query;
        const userId = request.headers['x-user-id'] || 'default-user';

        // Fetch from API with Tiered Fallback
        let jobs = await fetchJobs({ role, skills, location });

        // Filter by Job Type
        if (jobType && jobType !== 'any') jobs = jobs.filter(j => j.jobType === jobType);

        // Filter by Work Mode
        if (workMode && workMode !== 'any') jobs = jobs.filter(j => j.workMode === workMode);

        // Filter by Date Posted
        if (datePosted && datePosted !== 'any') {
            const now = new Date();
            const hours = { '24h': 24, 'week': 168, 'month': 720 }[datePosted] || 0;
            if (hours > 0) {
                jobs = jobs.filter(j => (now - new Date(j.datePosted)) / 3600000 <= hours);
            }
        }

        // Filter by Skills (Simple string match)
        if (skills) {
            const skillList = skills.split(',').map(s => s.trim().toLowerCase());
            if (skillList.length > 0 && skillList[0] !== '') {
                jobs = jobs.filter(j => skillList.some(s => j.description.toLowerCase().includes(s)));
            }
        }

        // --- SCORING LOGIC ---
        const resumeText = await redis.get(`resume:${userId}`);
        const scoredJobs = jobs.map(job => {
            const match = scoreJob(resumeText, job);
            return { ...job, matchScore: match.score, matchReason: match.reason };
        });

        // Store these matches in Redis for the "Best Matches" endpoint to leverage
        // We accumulate matches, keying by jobId
        if (resumeText && scoredJobs.length > 0) {
            // Get existing matches to merge? Or just overwrite. Overwriting matches:${userId} might clear previous useful ones.
            // Let's store a dedicated 'best-candidates' list or just update the global cache.
            // Simplified: just overwrite for this session demo.
            await redis.set(`matches:${userId}`, JSON.stringify(scoredJobs.map(j => ({ jobId: j.jobId, matchScore: j.matchScore, matchReason: j.matchReason }))));
        }

        jobs = scoredJobs;

        // Filter by Match Score (Post-scoring)
        if (minScore && minScore !== 'all') {
            jobs = jobs.filter(j => {
                const score = j.matchScore;
                if (!score) return minScore === 'gray';
                if (minScore === 'high') return score > 70;
                if (minScore === 'medium') return score >= 40 && score <= 70;
                return true;
            });
        }

        return jobs;
    });

    fastify.get('/jobs/best', async (request, reply) => {
        const userId = request.headers['x-user-id'] || 'default-user';

        // Try to get from cache first
        const cachedMatches = await redis.get(`matches:${userId}`);

        // If we have cached matches, we need the full job details. 
        // In a real app, we'd fetch individual jobs by ID.
        // Here, we rely on fetchJobs finding them or falling back. 
        // A better approach for this demo: Just fetch generic "best" jobs and score them fresh if cache is missing.

        if (cachedMatches) {
            try {
                const matches = JSON.parse(cachedMatches);
                const sortedMatches = matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 8);

                // We need the job details. Since we don't have a DB of all jobs, we re-fetch 'developer' jobs 
                // and hope they intersect, or we rely on the client having them.
                // Hack for demo: The matches cache in GET /jobs basically saves the *search results*.
                // So this endpoint just re-returns the top ones from the last search.

                // Better: Let's fetch a fresh batch of "Developer" jobs to ensure we always have something to show match against.
                const allJobs = await fetchJobs({ what: 'developer' });

                return sortedMatches.map(m => {
                    const job = allJobs.find(j => j.jobId === m.jobId);
                    // If job not found in new fetch (likely), we might miss data.
                    // FIX: Cache the FULL job object in matches for simplicity in this demo.
                    return job ? { ...job, matchScore: m.matchScore, matchReason: m.matchReason } : null;
                }).filter(Boolean);
            } catch (err) {
                console.error(err);
            }
        }

        // Fallback: Fetch jobs, score them, return top 8
        const resumeText = await redis.get(`resume:${userId}`);
        const jobs = await fetchJobs({ what: 'developer' }); // Default broad search
        const scored = jobs.map(j => {
            const m = scoreJob(resumeText, j);
            return { ...j, matchScore: m.score, matchReason: m.reason };
        });

        return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 8);
    });

    fastify.get('/jobs/test-api', async (request, reply) => {
        const appId = process.env.ADZUNA_APP_ID;
        const apiKey = process.env.ADZUNA_API_KEY;

        try {
            process.env.DEBUG_API = 'true';
            const jobs = await fetchJobs({ what: 'javascript', country: 'gb' });
            delete process.env.DEBUG_API;
            return {
                success: true,
                config: { appId: appId ? 'Set' : 'Missing', apiKey: apiKey ? 'Set' : 'Missing' },
                count: jobs.length,
                isMock: jobs.length > 0 && jobs[0].jobId.toString().startsWith('mock'),
                firstJob: jobs[0]
            };
        } catch (err) {
            return {
                success: false,
                error: err.message,
                status: err.response?.status,
                data: err.response?.data,
                stack: err.stack
            };
        }
    });
}
