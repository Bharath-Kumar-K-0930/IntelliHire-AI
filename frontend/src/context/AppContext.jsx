import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [guestId] = useState('demo-user-' + Math.random().toString(36).substr(2, 9));
    // If user is logged in, use their ID. Else use guest ID.
    const userId = user ? user._id : guestId;

    const [jobs, setJobs] = useState([]);
    const [resume, setResume] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [resumeExists, setResumeExists] = useState(true);

    const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: {
            'x-user-id': userId,
            'Authorization': token ? `Bearer ${token}` : ''
        }
    });

    useEffect(() => {
        if (token) {
            // Validate or just decode if we trusted it. For now, let's assume if token exists, we might need to fetch user profile? 
            // Or just persist the user object in localstorage too?
            const storedUser = localStorage.getItem('user');
            if (storedUser) setUser(JSON.parse(storedUser));
        }
        checkResumeStatus();
    }, [token]);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            setUser(data);
            setToken(data.token);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Login failed:', error.response?.data?.error || error.message);
            throw error;
        }
    };

    const register = async (name, email, password) => {
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
            setUser(data);
            setToken(data.token);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Registration failed:', error.response?.data?.error || error.message);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    const checkResumeStatus = async () => {
        try {
            const res = await api.get('/resume');
            setResumeExists(!!res.data.resumeText);
        } catch (error) {
            // console.error('Error checking resume status:', error);
            setResumeExists(false);
        }
    };

    const fetchJobs = async (filters = {}) => {
        setLoading(true);
        try {
            const res = await api.get('/jobs', { params: filters });
            setJobs(res.data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const uploadResume = async (file) => {
        const formData = new FormData();
        formData.append('resume', file);
        try {
            await api.post('/resume/upload', formData);
            setResume(file.name);
            setResumeExists(true);
            return true;
        } catch (error) {
            console.error('Upload failed:', error);
            throw error;
        }
    };

    const fetchApplications = async () => {
        if (!user) return;
        try {
            const { data } = await api.get('/applications');
            setApplications(data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        }
    };

    const applyToJob = async (job) => {
        try {
            const { data } = await api.post('/applications', { job });
            setApplications(prev => [data, ...prev]);
            return data;
        } catch (error) {
            console.error('Error applying:', error);
            throw error;
        }
    };

    const updateApplicationStatus = async (id, status) => {
        try {
            const { data } = await api.patch(`/applications/${id}`, { status });
            setApplications(prev => prev.map(app => app._id === id ? data : app));
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    return (
        <AppContext.Provider value={{
            jobs, fetchJobs, resume, uploadResume,
            applications, fetchApplications, applyToJob, updateApplicationStatus,
            loading, userId, api, resumeExists,
            user, login, register, logout
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
