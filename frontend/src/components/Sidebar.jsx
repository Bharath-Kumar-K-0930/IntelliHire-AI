import React, { useState } from 'react';
import { Briefcase, FileText, CheckCircle, Menu, X, Settings, LogOut, LogIn, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import DarkModeToggle from './DarkModeToggle';

const navItems = [
    { icon: Briefcase, label: 'Jobs', path: '/jobs' },
    { icon: FileText, label: 'Resume', path: '/resume' },
    { icon: CheckCircle, label: 'Applications', path: '/applications' },
    { icon: User, label: 'Profile', path: '/profile' },
];

import { useToast } from '../context/ToastContext';

const Sidebar = () => {
    const { user, logout } = useApp();
    const { addToast } = useToast();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        addToast('Successfully signed out.', 'success');
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-slate-800 rounded-lg text-white shadow-xl border border-slate-700"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={`
        w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col fixed z-50 transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <img src="/logo.png" alt="IntelliHire" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white leading-none group-hover:text-primary-600 transition-colors">
                                IntelliHire
                            </h1>
                            <span className="text-[8px] font-black uppercase text-primary-600 dark:text-primary-400 tracking-widest">AI Recruiter</span>
                        </div>
                    </div>
                    <DarkModeToggle />
                </div>

                <nav className="flex-1 p-4 space-y-1 mt-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${location.pathname === item.path
                                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 transition-colors ${location.pathname === item.path ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'}`} />
                            <span className="text-sm tracking-wide">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100 dark:border-slate-700 space-y-2">
                    {user ? (
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 mb-2">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-lg flex items-center justify-center font-bold text-xs border border-primary-200 dark:border-primary-700">
                                    {user.name?.charAt(0) || 'U'}
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-all"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-primary-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-primary-700 transition-all shadow-lg shadow-slate-900/10 dark:shadow-primary-900/20 active:scale-95">
                            <LogIn className="w-4 h-4" />
                            Sign In / Join
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
};

export default Sidebar;
