import axios from 'axios';
import dotenv from 'dotenv';
import redis from '../redis/client.js'; // Import Redis client

dotenv.config();

const RAPID_API_BASE_URL = 'https://jsearch.p.rapidapi.com/search';

const fetchFromJSearch = async ({ query, page = 1 }) => {
    try {
        const apiKey = process.env.RAPIDAPI_KEY;
        const apiHost = process.env.RAPIDAPI_HOST;

        if (!apiKey || !apiHost) {
            console.warn('RapidAPI credentials missing: RAPIDAPI_KEY or RAPIDAPI_HOST');
            return null;
        }

        // Cache Key generation
        const cacheKey = `jobs:${query}:${page}`;

        // 1. Try fetching from Redis Cache first
        console.log(`Checking cache for: ${cacheKey}`);
        const cachedJobs = await redis.get(cacheKey);

        if (cachedJobs) {
            console.log('Returning cached jobs from Redis');
            // Redis returns string/object depending on client config, ensure we parse if string
            return typeof cachedJobs === 'string' ? JSON.parse(cachedJobs) : cachedJobs;
        }

        console.log(`Cache miss. Calling JSearch API for: "${query}" (Page ${page})`);

        const options = {
            method: 'GET',
            url: RAPID_API_BASE_URL,
            params: {
                query: query,
                page: page.toString(),
                num_pages: '5'
            },
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': apiHost
            }
        };

        const response = await axios.request(options);
        const data = response.data.data;

        if (!data) return null;

        const formattedJobs = data.map(job => ({
            jobId: job.job_id,
            title: job.job_title,
            company: job.employer_name || 'Anonymous',
            location: `${job.job_city || ''}, ${job.job_country || ''}`.replace(/^, /, '').trim() || 'Remote',
            description: job.job_description,
            jobType: job.job_employment_type ? mapJobType(job.job_employment_type.toLowerCase()) : 'Full-time',
            workMode: job.job_is_remote ? 'Remote' : 'On-site',
            datePosted: job.job_posted_at_datetime_utc || new Date().toISOString(),
            applyUrl: job.job_apply_link,
            salary: (job.job_min_salary && job.job_max_salary)
                ? `$${job.job_min_salary} - $${job.job_max_salary}`
                : 'Not disclosed',
            logo: job.employer_logo
        }));

        // 2. Store result in Redis Cache (expire in 1 hour = 3600 seconds)
        if (formattedJobs.length > 0) {
            console.log(`Caching ${formattedJobs.length} jobs in Redis`);
            await redis.set(cacheKey, JSON.stringify(formattedJobs), { ex: 3600 });
        }

        return formattedJobs;

    } catch (error) {
        console.error('JSearch API Error:', error.message);
        if (error.response) {
            console.error('API Response:', error.response.status, error.response.data);
            if ([401, 403, 429].includes(error.response.status)) {
                throw new Error('API_QUOTA_EXHAUSTED');
            }
        }
        return null;
    }
};

export const fetchJobs = async ({ page = 1, role = '', skills = '', location = '' }) => {
    try {
        let queryParts = [];

        if (role) {
            const roleList = role.split(',').map(r => r.trim()).filter(Boolean);
            if (roleList.length > 1) {
                queryParts.push(`(${roleList.join(' OR ')})`);
            } else if (roleList.length === 1) {
                queryParts.push(roleList[0]);
            }
        }

        if (skills) {
            const skillList = skills.split(',').map(s => s.trim()).filter(Boolean);
            if (skillList.length > 1) {
                queryParts.push(`(${skillList.join(' OR ')})`);
            } else if (skillList.length === 1) {
                queryParts.push(skillList[0]);
            }
        }

        let baseQuery = queryParts.join(' ').trim();

        // Tiered Search Logic with Redis Caching implicitly handling duplicates via cache keys
        // Tier 1: Full Query (Role + Skills + Location)
        if (baseQuery && location) {
            const fullQuery = `${baseQuery} in ${location}`;
            const jobs = await fetchFromJSearch({ query: fullQuery, page });
            if (jobs && jobs.length > 0) return jobs;
        }

        // Tier 2: Role + Skills (Fallback if Tier 1 fails, or if no location specified)
        if (baseQuery) {
            const jobs = await fetchFromJSearch({ query: baseQuery, page });
            if (jobs && jobs.length > 0) return jobs;
        }

        // Tier 3: Location Only (last resort, generic jobs in area)
        if (location) {
            const jobs = await fetchFromJSearch({ query: `Jobs in ${location}`, page });
            if (jobs && jobs.length > 0) return jobs;
        }

        // Tier 4: Fallback to broad "Developer" search if nothing else worked
        console.log('No specific criteria met, fetching general Developer jobs');
        const jobs = await fetchFromJSearch({ query: 'Software Developer', page });
        if (jobs && jobs.length > 0) return jobs;

        // Fallback to Mock Data if API returns empty arrays across all valid tiers
        console.warn('JSearch API returned no results for all tiers. Returning Mock Data as fallback.');
        return getFilteredMockJobs(role, location, skills);

    } catch (error) {
        if (error.message === 'API_QUOTA_EXHAUSTED') {
            console.warn('JSearch API rate limit reached or invalid credentials (429/401/403). Falling back directly to Mock Data to prevent 0 results cascade.');
            return getFilteredMockJobs(role, location, skills);
        }
        console.error('Unexpected error during fetchJobs:', error);
        return getFilteredMockJobs(role, location, skills);
    }
};

const getFilteredMockJobs = (role, location, skills) => {
    let mockJobs = getMockJobs();

    if (role) {
        const roleList = role.split(',').map(r => r.trim().toLowerCase()).filter(Boolean);
        if (roleList.length > 0) {
            mockJobs = mockJobs.filter(j => roleList.some(r => j.title.toLowerCase().includes(r) || j.description.toLowerCase().includes(r)));
        }
    }

    if (location) {
        const locList = location.split(' OR ').map(l => l.trim().toLowerCase()).filter(Boolean);
        if (locList.length > 0) {
            mockJobs = mockJobs.filter(j => locList.some(l => j.location.toLowerCase().includes(l) || j.workMode.toLowerCase() === 'remote'));
        }
    }

    if (skills) {
        const skillList = skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
        if (skillList.length > 0) {
            mockJobs = mockJobs.filter(j => skillList.some(s => j.description.toLowerCase().includes(s) || j.title.toLowerCase().includes(s)));
        }
    }

    // Always return at least some jobs if it filters down to absolutely 0, to avoid blank screen
    return mockJobs.length > 0 ? mockJobs : getMockJobs();
};

const mapJobType = (type) => {
    if (type === 'permanent' || type === 'fulltime' || type === 'full-time') return 'Full-time';
    if (type === 'contract' || type === 'contractor') return 'Contract';
    if (type === 'intern' || type === 'internship') return 'Internship';
    return 'Part-time';
};

const getMockJobs = () => [
    {
        jobId: 'mock1',
        title: 'Frontend Developer',
        company: 'TechFlow Systems',
        location: 'Bangalore, India',
        description: 'Looking for a React expert with experience in Tailwind and AI integration. Building next-gen professional platforms.',
        jobType: 'Full-time',
        workMode: 'Remote',
        datePosted: new Date(Date.now() - 3600000).toISOString(),
        applyUrl: 'https://example.com/apply'
    },
    {
        jobId: 'mock2',
        title: 'Node.js Backend Engineer',
        company: 'Cloud Scale',
        location: 'Remote',
        description: 'Build fast APIs with Fastify and Redis. Experience with Google Gemini is a plus for AI-driven features.',
        jobType: 'Contract',
        workMode: 'Remote',
        datePosted: new Date(Date.now() - 86400000).toISOString(),
        applyUrl: 'https://example.com/apply'
    },
    {
        jobId: 'mock3',
        title: 'Financial Analyst',
        company: 'Global Capital',
        location: 'Mumbai, India',
        description: 'Perform market research and financial modeling. Proficiency in Excel and Python is required.',
        jobType: 'Full-time',
        workMode: 'On-site',
        datePosted: new Date(Date.now() - 172800000).toISOString(),
        applyUrl: 'https://example.com/apply'
    },
    {
        jobId: 'mock4',
        title: 'Digital Marketing Specialist',
        company: 'Social Wave',
        location: 'Delhi, India',
        description: 'Manage social media campaigns and SEO. Experience with Meta Ads and Google Analytics.',
        jobType: 'Part-time',
        workMode: 'Hybrid',
        datePosted: new Date().toISOString(),
        applyUrl: 'https://example.com/apply'
    },
    {
        jobId: 'mock5',
        title: 'HR Manager',
        company: 'People First',
        location: 'Hyderabad, India',
        description: 'Oversee recruitment and employee relations. Strong communication and leadership skills needed.',
        jobType: 'Full-time',
        workMode: 'On-site',
        datePosted: new Date(Date.now() - 432000000).toISOString(),
        applyUrl: 'https://example.com/apply'
    },
    {
        jobId: 'mock6',
        title: 'Healthcare Administrator',
        company: 'City Hospital',
        location: 'Chennai, India',
        description: 'Manage hospital operations and compliance. Knowledge of healthcare regulations is a must.',
        jobType: 'Full-time',
        workMode: 'On-site',
        datePosted: new Date(Date.now() - 604800000).toISOString(),
        applyUrl: 'https://example.com/apply'
    },
    {
        jobId: 'mock7',
        title: 'UX Researcher',
        company: 'Design Hub',
        location: 'Pune, India',
        description: 'Conduct user interviews and usability testing for enterprise SaaS products.',
        jobType: 'Internship',
        workMode: 'Remote',
        datePosted: new Date().toISOString(),
        applyUrl: 'https://example.com/apply'
    },
    {
        jobId: 'mock8',
        title: 'Sales Strategy Lead',
        company: 'Market Growth',
        location: 'New York, USA',
        description: 'Develop sales strategies and manage key account relationships globally.',
        jobType: 'Full-time',
        workMode: 'Hybrid',
        datePosted: new Date(Date.now() - 2592000000).toISOString(),
        applyUrl: 'https://example.com/apply'
    },
    {
        jobId: 'mock9',
        title: 'Legal Counsel',
        company: 'Justice Partners',
        location: 'London, UK',
        description: 'Advise on corporate law and contract negotiations for international clients.',
        jobType: 'Contract',
        workMode: 'On-site',
        datePosted: new Date(Date.now() - 1209600000).toISOString(),
        applyUrl: 'https://example.com/apply'
    },
    {
        jobId: 'mock10',
        title: 'Content Strategist',
        company: 'Media Labs',
        location: 'Remote',
        description: 'Plan and create engaging content across multiple digital platforms. Strong writing skills.',
        jobType: 'Part-time',
        workMode: 'Remote',
        datePosted: new Date(Date.now() - 7200000).toISOString(),
        applyUrl: 'https://example.com/apply'
    },
    {
        jobId: 'mock11',
        title: 'Embedded Systems Engineer',
        company: 'Chip Dynamics',
        location: 'Bangalore, India',
        description: 'Design and develop firmware for IoT devices. C/C++ and Real-time OS experience.',
        jobType: 'Full-time',
        workMode: 'On-site',
        datePosted: new Date(Date.now() - 345600000).toISOString(),
        applyUrl: 'https://example.com/apply'
    },
    {
        jobId: 'mock12',
        title: 'Retail Store Manager',
        company: 'Fashion Trend',
        location: 'Ahmedabad, India',
        description: 'Oversee daily operations and team performance in a high-traffic retail environment.',
        jobType: 'Full-time',
        workMode: 'On-site',
        datePosted: new Date(Date.now() - 864000000).toISOString(),
        applyUrl: 'https://example.com/apply'
    },
    {
        jobId: 'mock13',
        title: 'Data Architect',
        company: 'InfoSphere',
        location: 'Hyderabad, India',
        description: 'Design enterprise-scale data warehouses and ETL pipelines. Expertise in SQL and Spark.',
        jobType: 'Full-time',
        workMode: 'Hybrid',
        datePosted: new Date(Date.now() - 518400000).toISOString(),
        applyUrl: 'https://example.com/apply'
    },
    {
        jobId: 'mock14',
        title: 'Project Coordinator',
        company: 'BuildRight',
        location: 'Jaipur, India',
        description: 'Coordinate schedules and resources for construction projects. Knowledge of AutoCAD is helpful.',
        jobType: 'Contract',
        workMode: 'On-site',
        datePosted: new Date(Date.now() - 1296000000).toISOString(),
        applyUrl: 'https://example.com/apply'
    },
    {
        jobId: 'mock15',
        title: 'Customer Success Manager',
        company: 'SaaS Solutions',
        location: 'Gurgaon, India',
        description: 'Drive user adoption and renewals for cloud-based HR platforms.',
        jobType: 'Full-time',
        workMode: 'Remote',
        datePosted: new Date(Date.now() - 259200000).toISOString(),
        applyUrl: 'https://example.com/apply'
    },
    {
        jobId: 'mock16',
        title: 'Python Developer',
        company: 'AI Frontiers',
        location: 'Bangalore, India',
        description: 'Develop backends for AI-powered data labeling tools. Django/Flask experience.',
        jobType: 'Full-time',
        workMode: 'Remote',
        datePosted: new Date(Date.now() - 172800000).toISOString(),
        applyUrl: 'https://example.com/apply'
    },
    {
        jobId: 'mock17',
        title: 'Video Editor',
        company: 'Creative Studio',
        location: 'Mumbai, India',
        description: 'Edit high-quality video content for advertising and web series. Adobe Premiere expert.',
        jobType: 'Freelance',
        workMode: 'Hybrid',
        datePosted: new Date(Date.now() - 604800000).toISOString(),
        applyUrl: 'https://example.com/apply'
    },
    {
        jobId: 'mock18',
        title: 'Product Designer',
        company: 'TechFlow Systems',
        location: 'Bangalore, India',
        description: 'Design intuitive interfaces and user journeys. Figma and prototyping skills required.',
        jobType: 'Full-time',
        workMode: 'Hybrid',
        datePosted: new Date(Date.now() - 86400000).toISOString(),
        applyUrl: 'https://example.com/apply'
    }
];
