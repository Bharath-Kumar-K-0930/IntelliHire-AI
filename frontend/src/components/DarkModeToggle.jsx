import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';

const DarkModeToggle = () => {
    const { isDarkMode, toggleDarkMode } = useDarkMode();

    return (
        <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 group"
            aria-label="Toggle dark mode"
        >
            {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-500 group-hover:rotate-180 transition-transform duration-500" />
            ) : (
                <Moon className="w-5 h-5 text-slate-700 group-hover:-rotate-12 transition-transform duration-300" />
            )}
        </button>
    );
};

export default DarkModeToggle;
