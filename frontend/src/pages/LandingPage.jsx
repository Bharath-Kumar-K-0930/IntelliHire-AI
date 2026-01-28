
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Search, FileText, Layout, Github, Linkedin, Mail, Instagram, Sparkles, Upload, Zap, TrendingUp } from 'lucide-react';
import DarkModeToggle from '../components/DarkModeToggle';

const LandingPage = () => {
    return (
        <div className="bg-white dark:bg-slate-900 min-h-screen font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-14 h-14 aspect-square bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
                            <img src="/logo.png" alt="IntelliHire AI" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xl font-black tracking-tight dark:text-white">IntelliHire AI</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 font-bold text-sm text-slate-500 dark:text-slate-400">
                        <a href="#features" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">How it Works</a>
                        <a href="https://github.com/Bharath-Kumar-K-0930/IntelliHire-AI" target="_blank" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Github</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <DarkModeToggle />
                        <Link to="/login" className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">Sign In</Link>
                        <Link to="/register" className="btn-primary px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-32 pb-40 lg:pb-60 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 -left-40 w-[500px] h-[500px] bg-primary-200/40 rounded-full blur-[120px] mix-blend-multiply filter animate-blob"></div>
                    <div className="absolute top-0 -right-40 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[120px] mix-blend-multiply filter animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-40 left-20 w-[600px] h-[600px] bg-pink-200/40 rounded-full blur-[120px] mix-blend-multiply filter animate-blob animation-delay-4000"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in-up">
                        <Sparkles className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                        <span>AI-Powered Recruitment Revolution</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white mb-8 leading-tight animate-fade-in-up delay-100">
                        Your Dream Job, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400">Found by Intelligence.</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-12 animate-fade-in-up delay-200">
                        Stop endlessly scrolling. IntelliHire analyzes your resume and matches you with jobs that fit your skills perfectly using advanced AI.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
                        <Link to="/register" className="w-full sm:w-auto btn-primary px-8 py-4 rounded-xl text-lg font-bold shadow-xl shadow-primary-600/30 hover:scale-105 transition-transform flex items-center justify-center gap-2">
                            Start Your Search <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-xl text-lg font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all flex items-center justify-center gap-2">
                            <Layout className="w-5 h-5" />
                            View Demo
                        </Link>
                    </div>

                    {/* Quick Stats or abstract visual */}
                    <div className="mt-20 relative max-w-4xl mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent to-transparent z-20 h-full w-full"></div>
                        <img
                            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"
                            alt="Dashboard Preview"
                            className="rounded-3xl shadow-2xl border-4 border-slate-200/50 dark:border-slate-700/50 transform rotate-x-12 perspective-1000 rotate-1 w-full"
                        />
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section id="features" className="py-24 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Why Choose IntelliHire?</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">We don't just list jobs. We understand your career path and find the perfect match.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Search, title: "Smart Job Matching", desc: "Our AI scans thousands of jobs to find the ones that match your resume's unique skill set." },
                            { icon: FileText, title: "Resume Analysis", desc: "Get instant feedback on your resume and see exactly why you're a good fit for a role." },
                            { icon: CheckCircle, title: "Application Tracking", desc: "Keep track of all your applications, interview stages, and offers in one clean dashboard." }
                        ].map((feature, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 hover:border-primary-100 dark:hover:border-primary-800 hover:shadow-xl hover:shadow-primary-900/5 dark:hover:shadow-primary-500/10 transition-all group">
                                <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section id="how-it-works" className="py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="inline-block px-4 py-1.5 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/40 rounded-full">
                            The Process
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">HOW IT WORKS</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                            Experience a seamless journey from uploading your resume to landing your next opportunity.
                        </p>
                    </div>

                    <div className="relative">
                        {/* Connecting Line for Desktop */}
                        <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent -translate-y-1/2 z-0"></div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
                            {[
                                {
                                    step: "01",
                                    icon: Upload,
                                    title: "Upload Resume",
                                    desc: "Simply drop your PDF or TXT resume. Our system handles the rest.",
                                    color: "bg-blue-500"
                                },
                                {
                                    step: "02",
                                    icon: Zap,
                                    title: "AI Analysis",
                                    desc: "Gemini AI extracts your skills, experience, and career trajectory in seconds.",
                                    color: "bg-amber-500"
                                },
                                {
                                    step: "03",
                                    icon: Search,
                                    title: "Smart Matching",
                                    desc: "Browse real-world jobs automatically ranked by their match to your profile.",
                                    color: "bg-emerald-500"
                                },
                                {
                                    step: "04",
                                    icon: TrendingUp,
                                    title: "Track Success",
                                    desc: "Manage applications, track interviews, and celebrate offers in one place.",
                                    color: "bg-primary-600"
                                }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center group">
                                    <div className="relative mb-8">
                                        <div className={`w-20 h-20 ${item.color} rounded-2xl shadow-xl flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300`}>
                                            <item.icon className="w-10 h-10 text-white" />
                                        </div>
                                        <div className="absolute -top-4 -right-4 w-10 h-10 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-full flex items-center justify-center font-black text-xs text-primary-600 dark:text-primary-400 shadow-sm">
                                            {item.step}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">{item.title}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed text-center px-4 max-w-xs">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-20 text-center">
                        <Link to="/register" className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold hover:gap-3 transition-all">
                            Create your free account to get started <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11.5 2L15 2L11 10L16 10L7 22L10 12L5 12L11.5 2Z" />
                                    </svg>
                                </div>
                                <span className="text-xl font-bold tracking-tight">IntelliHire AI</span>
                            </div>
                            <p className="text-slate-400 max-w-sm mb-6">
                                Revolutionizing the recruitment process with advanced AI to connect talent with opportunity seamlessly.
                            </p>
                            <div className="flex gap-4">
                                <a href="https://github.com/Bharath-Kumar-K-0930" target="_blank" className="w-10 h-10 bg-slate-800 hover:bg-primary-600 rounded-xl flex items-center justify-center transition-colors">
                                    <Github className="w-5 h-5" />
                                </a>
                                <a href="https://www.linkedin.com/in/bharath-kumar-k-b35ba0304" target="_blank" className="w-10 h-10 bg-slate-800 hover:bg-[#0077b5] rounded-xl flex items-center justify-center transition-colors">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                                <a href="https://www.instagram.com/bhar_ath.b.k/" target="_blank" className="w-10 h-10 bg-slate-800 hover:bg-[#E4405F] rounded-xl flex items-center justify-center transition-colors">
                                    <Instagram className="w-5 h-5" />
                                </a>
                                <a href="mailto:bharathkumarkbk10@gmail.com" className="w-10 h-10 bg-slate-800 hover:bg-red-500 rounded-xl flex items-center justify-center transition-colors">
                                    <Mail className="w-5 h-5" />
                                </a>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-bold mb-6">Quick Links</h4>
                            <ul className="space-y-4 text-slate-400 font-medium">
                                <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
                                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
                                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                                <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                                <li><Link to="/register" className="hover:text-white transition-colors">Get Started</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-lg font-bold mb-6">Project Info</h4>
                            <ul className="space-y-4 text-slate-400 font-medium">
                                <li>
                                    <a href="https://github.com/Bharath-Kumar-K-0930/IntelliHire-AI.git" target="_blank" className="flex items-center gap-2 hover:text-white transition-colors">
                                        <Github className="w-4 h-4" /> Source Code
                                    </a>
                                </li>
                                <li>
                                    <span className="text-xs uppercase tracking-widest text-slate-500">Version 1.0.0</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-slate-800 text-center text-slate-500 text-sm font-medium">
                        &copy; 2026 IntelliHire AI. Built by Bharath Kumar K.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

