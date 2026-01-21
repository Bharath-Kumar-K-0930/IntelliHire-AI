import React, { useState, useEffect } from 'react';
import { Upload, FileCheck, RefreshCw, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ResumeUploadModal = () => {
    const { resumeExists, uploadResume } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        // Only open if resume check has finished (resumeExists is explicit true/false, not null/undefined if initialized that way)
        // In AppContext we init as true, then set to false if fetch fails.
        // Wait, if it inits as true, it won't show.
        // If it switches to false (because of API check), then we show it.
        // So: if resumeExists === false, set Open.
        if (resumeExists === false) {
            setIsOpen(true);
        }
    }, [resumeExists]);

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        const success = await uploadResume(file);
        if (success) {
            setIsOpen(false);
        }
        setUploading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 border border-primary-100 shadow-sm">
                    <Upload className="w-8 h-8 text-primary-600" />
                </div>

                <h2 className="text-2xl font-black text-slate-900 mb-2">Upload Your Resume</h2>
                <p className="text-slate-500 mb-8 font-medium">To unlock AI-powered job matching and personalized recommendations, please upload your CV.</p>

                <label
                    htmlFor="modal-resume-upload"
                    className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 mb-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500/50 hover:bg-primary-50/10 transition-all group"
                >
                    <input
                        type="file"
                        id="modal-resume-upload"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files[0])}
                        accept=".pdf,.txt"
                    />
                    <FileCheck className="w-8 h-8 text-slate-300 mb-3 group-hover:text-primary-500 transition-colors" />
                    <span className="font-bold text-slate-700 text-sm break-all">
                        {file ? file.name : 'Click to select file'}
                    </span>
                    {!file && <span className="text-xs text-slate-400 mt-1">PDF or TXT</span>}
                </label>

                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {uploading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Upload & Continue'}
                </button>

                {!file && (
                    <button
                        onClick={() => setIsOpen(false)}
                        className="mt-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        Skip for now
                    </button>
                )}
            </div>
        </div>
    );
};

export default ResumeUploadModal;
