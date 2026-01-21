import React, { useState } from 'react';
import { MapPin, Clock, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

import { useToast } from '../context/ToastContext';

const JobCard = ({ job, isBestMatch }) => {
    const { applyToJob } = useApp();
    const { addToast } = useToast();
    // Removed specific match state as it's now prop-driven
    const [showApplyPopup, setShowApplyPopup] = useState(false);

    // Removed handleMatch as it's no longer used

    const handleApplyClick = () => {
        window.open(job.applyUrl, '_blank');
        setTimeout(() => setShowApplyPopup(true), 1500); // Simulate returning to tab after a bit
    };

    const confirmApply = async (status) => {
        if (status) {
            await applyToJob(job);
            addToast(`Application tracked for ${job.title}`, 'success');
        }
        setShowApplyPopup(false);
    };

    const getScoreColor = (score) => {
        if (score > 70) return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
        if (score > 40) return 'bg-amber-100 text-amber-700 border border-amber-200';
        return 'bg-slate-100 text-slate-500 border border-slate-200';
    };

    return (
        <div className={`card group relative bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 ${isBestMatch ? 'border-primary-500/50 dark:border-primary-500/50 bg-primary-50 dark:bg-primary-900/10' : ''}`}>
            {isBestMatch && (
                <div className="absolute -top-3 left-6 px-3 py-1 bg-primary-600 rounded-full flex items-center gap-1.5 text-xs font-bold text-white shadow-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                    BEST MATCH
                </div>
            )}

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors uppercase tracking-tight">
                        {job.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">{job.company}</p>
                </div>

                <div className="flex flex-col items-end">
                    {job.matchScore !== undefined ? (
                        <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${getScoreColor(job.matchScore)} mb-1`}>
                            {job.matchScore}% Match
                        </div>
                    ) : (
                        <span className="text-xs text-slate-500 dark:text-slate-500 font-bold uppercase tracking-wider">Score pending</span>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                    <Clock className="w-4 h-4" />
                    {job.jobType}
                </div>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-6 leading-relaxed">
                {job.description}
            </p>

            {job.matchReason && (
                <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                    <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        AI Insight
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                        {job.matchReason}
                    </p>
                </div>
            )}

            <button
                onClick={handleApplyClick}
                className="w-full btn-primary flex items-center justify-center gap-2"
            >
                Apply Now
                <ExternalLink className="w-4 h-4" />
            </button>

            {/* Smart Application Popup */}
            {showApplyPopup && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
                        <h2 className="text-2xl font-bold mb-2">Wait! Did you apply?</h2>
                        <p className="text-slate-400 mb-8">
                            We noticed you opened the application for <span className="text-white font-medium">{job.title}</span> at <span className="text-white font-medium">{job.company}</span>.
                        </p>
                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={() => confirmApply(true)} className="btn-primary w-full py-4">
                                Yes, I Applied
                            </button>
                            <button onClick={() => confirmApply(false)} className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-4 rounded-xl transition-all">
                                No, just browsing
                            </button>
                            <button onClick={() => confirmApply(true)} className="text-slate-500 hover:text-white text-sm font-medium pt-2 transition-all">
                                I Applied Earlier
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobCard;
