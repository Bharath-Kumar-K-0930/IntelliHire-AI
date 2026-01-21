import React, { useEffect, useState } from 'react';
import { Search, Filter, SlidersHorizontal, Sparkles, MapPin, Clock, Star, Target, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import JobCard from '../components/JobCard';

const MultiInput = ({ icon: Icon, placeholder, listId, options = [], value = [], onChange }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(inputValue);
        }
    };

    const addTag = (val) => {
        const trimmed = val.trim();
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed]);
            setInputValue('');
        } else if (trimmed && value.includes(trimmed)) {
            setInputValue(''); // Clear duplicate
        }
    };

    const removeTag = (tag) => {
        onChange(value.filter(t => t !== tag));
    };

    const handleBlur = () => {
        if (inputValue.trim()) {
            addTag(inputValue);
        }
    };

    const handleSelect = (e) => {
        // When using datalist, onChange triggers. We need to check if the new value matches an option or if the user is just typing.
        // A simple heuristic: if the value is in the options list, treat it as a selection.
        const val = e.target.value;
        setInputValue(val);
        // We defer the 'add' to Enter or Blur to allow partial typing, EXCEPT if it's a direct click (hard to detect perfectly with just datalist).
        // For now, we'll stick to Enter/Blur for adding, or if the user explicitly clicks a suggestion it usually fills the input and they press enter or click away.
    };

    return (
        <div className="relative group w-full h-full">
            <Icon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-600 transition-all group-hover:scale-110 z-10" />
            <div className={`w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-2 min-h-[60px] flex flex-wrap items-center gap-2 outline-none focus-within:ring-8 focus-within:ring-primary-500/10 focus-within:border-primary-500 transition-all shadow-sm group-hover:border-slate-300 cursor-text`} onClick={() => document.getElementById(`input-${listId}`).focus()}>
                {value.map(tag => (
                    <span key={tag} className="bg-primary-50 border border-primary-100 text-primary-700 px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 animate-in fade-in zoom-in duration-200 whitespace-nowrap">
                        {tag}
                        <button onClick={(e) => { e.stopPropagation(); removeTag(tag); }} className="hover:text-primary-900 p-0.5 hover:bg-primary-200 rounded-full transition-colors"><X size={10} /></button>
                    </span>
                ))}
                <input
                    id={`input-${listId}`}
                    type="text"
                    list={listId}
                    placeholder={value.length === 0 ? placeholder : ''}
                    value={inputValue}
                    onChange={handleSelect}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    className="flex-1 bg-transparent outline-none min-w-[80px] text-slate-900 font-bold placeholder:text-slate-400 text-sm py-1"
                />
            </div>
            <datalist id={listId}>
                {options.map((opt, idx) => (
                    <option key={`${listId}-${idx}`} value={opt} />
                ))}
            </datalist>
        </div>
    );
};

// Extracted Data Lists to avoid cluttering the render
const JOB_TITLES = [
    "Frontend Developer", "Backend Developer", "Full Stack Developer", "Software Engineer", "Data Scientist", "Product Manager", "UI/UX Designer", "DevOps Engineer", "Marketing Manager", "Sales Executive", "Accountant", "HR Manager",
    "Content Writer", "Graphics Designer", "Project Manager", "Mobile App Developer", "QA Engineer", "Data Analyst", "Digital Marketing Specialist", "Customer Support Representative", "Business Analyst", "Systems Administrator", "Network Engineer", "Security Analyst", "Database Administrator", "Cloud Architect",
    "Machine Learning Engineer", "AI Research Scientist", "Product Designer", "Social Media Manager", "SEO Specialist", "Copywriter", "Video Editor", "Architect", "Civil Engineer", "Mechanical Engineer", "Electrical Engineer", "Financial Analyst", "Lawyer", "Doctor", "Nurse", "Pharmacist", "Dentist",
    "Teacher", "Professor", "Researcher", "Laboratory Technician", "Chef", "Operations Manager", "Logistics Coordinator", "Supply Chain Analyst", "Sales Manager", "Account Manager", "Public Relations Specialist", "Event Planner", "Human Resources Specialist", "Recruiter", "Data Architect",
    "Embedded Systems Engineer", "Game Developer", "Technical Writer", "Solutions Architect", "IT Consultant", "Business Intelligence Developer", "Data Engineer", "Site Reliability Engineer", "Application Architect", "Mobile Developer", "iOS Developer", "Android Developer", "Web Designer", "Motion Graphics Artist",
    "Content Strategist", "Editor", "Proofreader", "Journalist", "Photographer", "Illustrator", "UI Designer", "UX Researcher", "Interaction Designer", "Visual Designer", "Brand Manager", "Market Researcher", "Financial Controller", "Auditor", "Tax Consultant", "Investment Banker", "Portfolio Manager",
    "Risk Analyst", "Compliance Officer", "Paralegal", "Legal Counsel", "Surgeon", "Veterinarian", "Optometrist", "Physiotherapist", "Psychotherapist", "Consultant", "Sales Strategy", "Customer Success", "Supply Chain", "Logistics", "HR Management", "Public Relations", "Medical Coding", "Legal Writing", "Financial Modeling"
];
const CITIES = [
    "Bangalore, India", "Mumbai, India", "Delhi, India", "Hyderabad, India", "Chennai, India", "Pune, India", "Kolkata, India", "Ahmedabad, India", "Jaipur, India", "Surat, India", "Lucknow, India", "Kanpur, India", "Nagpur, India", "Indore, India", "Thane, India", "Bhopal, India", "Visakhapatnam, India",
    "Pimpri-Chinchwad, India", "Patna, India", "Vadodara, India", "Ghaziabad, India", "Ludhiana, India", "Agra, India", "Nashik, India", "Faridabad, India", "Meerut, India", "Rajkot, India", "Kalyan-Dombivli, India", "Vasai-Virar, India", "Varanasi, India", "Srinagar, India", "Aurangabad, India", "Dhanbad, India",
    "Amritsar, India", "Navi Mumbai, India", "Allahabad, India", "Ranchi, India", "Haora, India", "Coimbatore, India", "Jabalpur, India", "Gwalior, India", "Vijayawada, India", "Jodhpur, India", "Madurai, India", "Raipur, India", "Kota, India", "Guwahati, India", "Chandigarh, India", "Solapur, India",
    "Hubballi-Dharwad, India", "Bareilly, India", "Moradabad, India", "Mysore, India", "Gurgaon, India", "Aligarh, India", "Jalandhar, India", "Tiruchirappalli, India", "Bhubaneswar, India", "Salem, India", "Mira-Bhayandar, India", "Thiruvananthapuram, India", "Bhiwandi, India", "Saharanpur, India",
    "Guntur, India", "Amravati, India", "Bikaner, India", "Noida, India", "Jamshedpur, India", "Bhilai, India", "Cuttack, India", "Firozabad, India", "Kochi, India", "Nellore, India", "Bhavnagar, India", "Dehradun, India", "Durgapur, India", "Asansol, India", "Rourkela, India", "Nanded, India", "Kolhapur, India",
    "Ajmer, India", "Akola, India", "Gulbarga, India", "Jamnagar, India", "Ujjain, India", "Loni, India", "Siliguri, India", "Jhansi, India", "Ulhasnagar, India", "Jammu, India", "Belgaum, India", "Tirunelveli, India", "Malegaon, India", "Gaya, India", "Ambattur, India", "Udaipur, India", "Kakinada, India",
    "New York, USA", "London, UK", "Tokyo, Japan", "Paris, France", "Berlin, Germany", "Toronto, Canada", "Sydney, Australia", "Singapore", "Dubai, UAE", "Remote"
];
const SKILLS = [
    "React", "Node.js", "Python", "Java", "SQL", "Excel", "Project Management", "Digital Marketing", "Salesforce", "JavaScript", "TypeScript", "C++", "C#", "AWS", "Azure", "Docker", "Kubernetes", "Git", "Figma", "Adobe XD", "Photoshop", "Illustrator", "Swift", "Kotlin", "Flutter", "React Native", "PHP",
    "Laravel", "Ruby on Rails", "Django", "Flask", "Express.js", "MongoDB", "PostgreSQL", "MySQL", "Redis", "GraphQL", "REST API", "Tailwind CSS", "Bootstrap", "Sass", "Webpack", "Babel", "Jenkins", "CI/CD", "Unit Testing", "Integration Testing", "TDD", "Agile", "Scrum", "Kanban", "SEO", "SEM",
    "Content Writing", "Copywriting", "Social Media Management", "Email Marketing", "Google Analytics", "Power BI", "Tableau", "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Data Analysis", "Data Visualization", "Statistics", "Probability", "R", "Matlab", "SAS", "AutoCAD", "SolidWorks",
    "Revit", "SketchUp", "3ds Max", "Blender", "Unreal Engine", "Unity", "Cybersecurity", "Networking", "Pen Testing", "Ethical Hacking", "Blockchain", "Solidity", "Smart Contracts", "Game Development", "VR/AR", "UI/UX Design", "Product Management", "Customer Success", "Sales Strategy", "Financial Modeling",
    "Accounting", "Legal Writing", "Medical Coding", "HR Management", "Public Relations", "Supply Chain", "Logistics", "Soft Skills", "Leadership", "Communication", "Problem Solving", "Critical Thinking", "Time Management", "Teamwork"
];

const JobFeed = () => {
    const { jobs, fetchJobs, loading, api } = useApp();
    // Search states (now arrays)
    const [roles, setRoles] = useState([]);
    const [locations, setLocations] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);

    const [bestMatches, setBestMatches] = useState([]);
    const [filters, setFilters] = useState({
        jobType: 'any',
        workMode: 'any',
        datePosted: 'any',
        minScore: 'all'
    });
    const [searchPerformed, setSearchPerformed] = useState(false);

    useEffect(() => {
        fetchBestMatches();
    }, []);

    const fetchBestMatches = async () => {
        try {
            const res = await api.get('/jobs/best');
            setBestMatches(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        setSearchPerformed(true);
        // Convert arrays to appropriate strings for the API
        const roleQuery = roles.join(' ');
        const locationQuery = locations.join(', ');
        const skillsQuery = selectedSkills.join(',');

        fetchJobs({
            role: roleQuery,
            location: locationQuery,
            skills: skillsQuery,
            ...filters
        });
    };

    return (
        <div className="flex-1 lg:ml-64 pt-20 lg:pt-0 bg-slate-50 dark:bg-slate-900 min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 lg:p-8">
                {/* Left Side - Search Filters */}
                <div className="lg:col-span-5 space-y-6">
                    <header className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div>
                                <span className="text-xs font-black uppercase text-primary-600 dark:text-primary-400 tracking-widest">Intelligent Search</span>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Job Discovery</h2>
                            </div>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                            AI-powered job matching tailored to your profile. Search by role, location, and skills.
                        </p>
                    </header>

                    {/* Search Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 space-y-6">
                        {/* Category Pills */}
                        <div>
                            <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-3 block">Quick Categories</label>
                            <div className="flex flex-wrap gap-2">
                                {['All Fields', 'Technology', 'Healthcare', 'Finance', 'Education', 'Marketing', 'Sales', 'Design'].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => {
                                            if (cat === 'All Fields') {
                                                setRoles([]);
                                            } else {
                                                if (!roles.includes(cat)) setRoles([...roles, cat]);
                                            }
                                        }}
                                        className={`px-4 py-2 border rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 ${roles.includes(cat)
                                            ? 'bg-primary-600 text-white border-primary-600'
                                            : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Role Search */}
                        <div>
                            <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-2 block">Job Role</label>
                            <MultiInput
                                icon={Search}
                                placeholder="e.g., QA Engineer, Developer..."
                                listId="job-titles"
                                options={JOB_TITLES}
                                value={roles}
                                onChange={setRoles}
                            />
                        </div>

                        {/* Location Search */}
                        <div>
                            <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-2 block">Location</label>
                            <MultiInput
                                icon={MapPin}
                                placeholder="e.g., Bangalore, India..."
                                listId="cities"
                                options={CITIES}
                                value={locations}
                                onChange={setLocations}
                            />
                        </div>

                        {/* Skills Filter */}
                        <div>
                            <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-2 block">Required Skills</label>
                            <MultiInput
                                icon={Sparkles}
                                placeholder="e.g., React, Node, Python..."
                                listId="skills-list"
                                options={SKILLS}
                                value={selectedSkills}
                                onChange={setSelectedSkills}
                            />
                        </div>

                        {/* Advanced Filters */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            {[
                                { label: 'Job Type', name: 'jobType', options: ['Any Type', 'Full-time', 'Part-time', 'Contract', 'Internship'] },
                                { label: 'Work Mode', name: 'workMode', options: ['Any Mode', 'Remote', 'Hybrid', 'On-site'] },
                                { label: 'Date Posted', name: 'datePosted', options: ['Any Time', '24h', 'week', 'month'] },
                                { label: 'Match Score', name: 'minScore', options: ['All Scores', 'High (>70%)', 'Medium (40-70%)'] }
                            ].map(f => (
                                <div key={f.name} className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">{f.label}</label>
                                    <select
                                        name={f.name}
                                        value={filters[f.name]}
                                        onChange={handleFilterChange}
                                        className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white font-bold outline-none focus:border-primary-500 transition-all cursor-pointer"
                                    >
                                        {f.options.map(o => (
                                            <option key={o} value={o === 'Any Type' || o === 'Any Mode' || o === 'Any Time' || o === 'All Scores' ? 'any' : o.includes('High') ? 'high' : o.includes('Medium') ? 'medium' : o}>{o}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>

                        {/* Search Button */}
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="w-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 text-white font-black rounded-xl py-4 shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-base uppercase tracking-wider"
                        >
                            <Search className="w-5 h-5" />
                            {loading ? 'Searching...' : 'Search Jobs'}
                        </button>
                    </div>

                    {/* Best Matches Section - Below Search */}
                    {bestMatches.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">Best Matches</h3>
                            </div>
                            <div className="space-y-4">
                                {bestMatches.slice(0, 3).map((job) => (
                                    <JobCard key={`best-${job.jobId}`} job={job} isBestMatch={true} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side - Search Results */}
                <div className="lg:col-span-7">
                    <div className="sticky top-24">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Target className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                    {searchPerformed ? 'Search Results' : 'Recent Jobs'}
                                </h3>
                            </div>
                            {jobs.length > 0 && (
                                <span className="text-sm font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">
                                    {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'} Found
                                </span>
                            )}
                        </div>

                        <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p className="text-slate-600 dark:text-slate-400 font-bold">Searching for jobs...</p>
                                </div>
                            ) : jobs.length === 0 ? (
                                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600">
                                    <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                        <SlidersHorizontal className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">
                                        {searchPerformed ? 'No Jobs Found' : 'Start Your Search'}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm font-medium mb-6 leading-relaxed">
                                        {searchPerformed
                                            ? 'No jobs available based on job title, key skills, in the area. Try searching for different criteria to find more opportunities.'
                                            : 'Use the search filters on the left to find jobs that match your skills and preferences. Enter a role, location, or skills to get started.'}
                                    </p>
                                    {searchPerformed && (
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Try:</span>
                                            {['Developer', 'Engineer', 'Manager', 'Designer'].map(suggestion => (
                                                <button
                                                    key={suggestion}
                                                    onClick={() => {
                                                        setRoles([suggestion]);
                                                        setTimeout(handleSearch, 100);
                                                    }}
                                                    className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg text-xs font-bold hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                jobs.map((job) => (
                                    <JobCard key={job.jobId} job={job} />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobFeed;
