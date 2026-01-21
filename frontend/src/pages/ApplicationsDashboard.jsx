
import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Filter, CheckCircle, Clock, XCircle, Briefcase } from 'lucide-react';

const ApplicationsDashboard = () => {
    const { applications, fetchApplications, updateApplicationStatus, user } = useApp();
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchApplications();
    }, [user]);

    const stats = {
        total: applications.length,
        applied: applications.filter(a => a.status === 'Applied').length,
        interview: applications.filter(a => a.status === 'Interview').length,
        offer: applications.filter(a => a.status === 'Offer').length,
        rejected: applications.filter(a => a.status === 'Rejected').length,
    };

    const filteredApps = filter === 'All'
        ? applications
        : applications.filter(a => a.status === filter);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Applied': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Interview': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Offer': return 'bg-green-100 text-green-700 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <Briefcase className="w-16 h-16 text-slate-300 mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Track Your Journey</h2>
                <p className="text-slate-500 mb-6">Sign in to view and manage your job applications.</p>
                <a href="/login" className="btn-primary px-8 py-3 rounded-xl">Sign In</a>
            </div>
        );
    }

    return (
        <div className="flex-1 lg:ml-64 bg-[#f3f2ef] min-h-screen">
            <div className="p-8 max-w-7xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Application Tracker</h1>
                    <p className="text-slate-500 font-medium text-lg">Manage your job search pipeline efficiently.</p>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
                    <div onClick={() => setFilter('All')} className={`cursor-pointer p-4 rounded-2xl border transition-all ${filter === 'All' ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                        <div className="text-sm font-bold uppercase tracking-wider opacity-70 mb-1">Total</div>
                        <div className="text-3xl font-black">{stats.total}</div>
                    </div>
                    <div onClick={() => setFilter('Applied')} className={`cursor-pointer p-4 rounded-2xl border transition-all ${filter === 'Applied' ? 'bg-blue-600 text-white border-blue-600 shadow-xl' : 'bg-white border-slate-200 hover:border-blue-200'}`}>
                        <div className="text-sm font-bold uppercase tracking-wider opacity-70 mb-1">Applied</div>
                        <div className="text-3xl font-black">{stats.applied}</div>
                    </div>
                    <div onClick={() => setFilter('Interview')} className={`cursor-pointer p-4 rounded-2xl border transition-all ${filter === 'Interview' ? 'bg-purple-600 text-white border-purple-600 shadow-xl' : 'bg-white border-slate-200 hover:border-purple-200'}`}>
                        <div className="text-sm font-bold uppercase tracking-wider opacity-70 mb-1">Interview</div>
                        <div className="text-3xl font-black">{stats.interview}</div>
                    </div>
                    <div onClick={() => setFilter('Offer')} className={`cursor-pointer p-4 rounded-2xl border transition-all ${filter === 'Offer' ? 'bg-green-600 text-white border-green-600 shadow-xl' : 'bg-white border-slate-200 hover:border-green-200'}`}>
                        <div className="text-sm font-bold uppercase tracking-wider opacity-70 mb-1">Offers</div>
                        <div className="text-3xl font-black">{stats.offer}</div>
                    </div>
                    <div onClick={() => setFilter('Rejected')} className={`cursor-pointer p-4 rounded-2xl border transition-all ${filter === 'Rejected' ? 'bg-red-600 text-white border-red-600 shadow-xl' : 'bg-white border-slate-200 hover:border-red-200'}`}>
                        <div className="text-sm font-bold uppercase tracking-wider opacity-70 mb-1">Rejected</div>
                        <div className="text-3xl font-black">{stats.rejected}</div>
                    </div>
                </div>

                {/* Timeline List */}
                <div className="space-y-4">
                    {filteredApps.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
                            <p className="text-slate-400 font-medium">No applications found in this stage.</p>
                        </div>
                    ) : (
                        filteredApps.map((app) => (
                            <div key={app._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between group">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-slate-900">{app.job.title}</h3>
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getStatusColor(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </div>
                                    <div className="text-slate-500 font-medium flex items-center gap-2 text-sm">
                                        <span>{app.job.company}</span>
                                        <span>•</span>
                                        <span>{app.job.location}</span>
                                        <span>•</span>
                                        <span className="text-slate-400">Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 w-full lg:w-auto">
                                    <select
                                        value={app.status}
                                        onChange={(e) => updateApplicationStatus(app._id, e.target.value)}
                                        className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl px-4 py-3 outline-none focus:border-primary-500 cursor-pointer w-full lg:w-48"
                                    >
                                        <option value="Applied">Applied</option>
                                        <option value="Interview">Interview</option>
                                        <option value="Offer">Offer</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                    <a
                                        href={app.job.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-3 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                                        title="View Job"
                                    >
                                        <Briefcase className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApplicationsDashboard;
