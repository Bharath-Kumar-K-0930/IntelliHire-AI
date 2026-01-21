import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api/jobs';

const fetchFromAdzuna = async ({ country = 'in', page = 1, resultsPerPage = 20, what = '', where = '' }) => {
    try {
        const appId = process.env.ADZUNA_APP_ID;
        const apiKey = process.env.ADZUNA_API_KEY;

        if (!appId || !apiKey) {
            console.warn('Adzuna credentials missing');
            return null;
        }

        const apiUrl = `${ADZUNA_BASE_URL}/${country}/search/${page}`;
        console.log(`Calling Adzuna API [what="${what}", where="${where}"]: ${apiUrl}`);

        const params = {
            app_id: appId,
            app_key: apiKey,
            results_per_page: resultsPerPage,
            what: what || '',
            content_type: 'application/json'
        };
        if (where) params.where = where;

        const response = await axios.get(apiUrl, { params });
        return response.data.results.map(job => ({
            jobId: job.id,
            title: job.title,
            company: job.company?.display_name || 'Anonymous',
            location: job.location?.display_name || 'Remote',
            description: job.description,
            jobType: mapJobType(job.contract_type),
            workMode: 'Remote',
            datePosted: job.created,
            applyUrl: job.redirect_url,
            salary: job.salary_min ? `${job.salary_min} - ${job.salary_max}` : 'Not disclosed'
        }));
    } catch (error) {
        console.error('Adzuna API Error:', error.message);
        return null;
    }
};

export const fetchJobs = async ({ country = 'in', page = 1, resultsPerPage = 20, role = '', skills = '', location = '' }) => {
    const hasCriteria = role || skills || location;

    // Priority 1: Role/Title and Location
    if (role || location) {
        console.log(`[Tier 1] Searching for Role: "${role}" in Location: "${location}"`);
        const jobs = await fetchFromAdzuna({ country, page, resultsPerPage, what: role, where: location });
        if (jobs && jobs.length > 0) return jobs;
    }

    // Priority 2: Skills
    if (skills) {
        console.log(`[Tier 2] Searching for Skills: "${skills}"`);
        const jobs = await fetchFromAdzuna({ country, page, resultsPerPage, what: skills.replace(/,/g, ' ') });
        if (jobs && jobs.length > 0) return jobs;
    }

    // Priority 3: Location Only
    if (location) {
        console.log(`[Tier 3] Searching for Location Only: "${location}"`);
        const jobs = await fetchFromAdzuna({ country, page, resultsPerPage, what: '', where: location });
        if (jobs && jobs.length > 0) return jobs;
    }

    // If search criteria were provided but no results found, return empty array (triggers "not found" UI)
    if (hasCriteria) {
        console.warn('All tiers failed for specific criteria, returning empty results.');
        return [];
    }

    // If no search criteria provided (e.g., initial load), return mock data for demo
    console.log('No criteria provided, returning mock data for initial load.');
    return getMockJobs();
};

const mapJobType = (type) => {
    if (type === 'permanent') return 'Full-time';
    if (type === 'contract') return 'Contract';
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
