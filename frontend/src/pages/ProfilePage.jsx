import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Code, Award, Globe, Heart, Lock, Save, Edit2, Plus, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

const ProfilePage = () => {
    const { user, api } = useApp();
    const { addToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        role: '',
        skills: [],
        experience: [],
        education: [],
        projects: [],
        internships: [],
        certifications: [],
        contact: {
            phone: '',
            linkedin: '',
            github: '',
            portfolio: '',
            location: ''
        },
        hobbies: [],
        languages: [],
        summary: ''
    });

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/resume');
            if (res.data.profile) {
                setProfile({
                    name: user?.name || res.data.profile.name || '',
                    email: user?.email || res.data.profile.contact?.email || '',
                    role: res.data.profile.role || '',
                    skills: res.data.profile.skills || [],
                    experience: res.data.profile.experience || [],
                    education: res.data.profile.education || [],
                    projects: res.data.profile.projects || [],
                    internships: res.data.profile.internships || [],
                    certifications: res.data.profile.certifications || [],
                    contact: res.data.profile.contact || {},
                    hobbies: res.data.profile.hobbies || [],
                    languages: res.data.profile.languages || [],
                    summary: res.data.profile.summary || ''
                });
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            await api.post('/profile/update', { profile });
            addToast('Profile updated successfully!', 'success');
            setIsEditing(false);
        } catch (error) {
            addToast('Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        if (passwords.newPassword !== passwords.confirmPassword) {
            addToast('Passwords do not match', 'error');
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/change-password', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            addToast('Password changed successfully!', 'success');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            addToast(error.response?.data?.error || 'Failed to change password', 'error');
        } finally {
            setLoading(false);
        }
    };

    const addArrayItem = (field, defaultValue) => {
        setProfile(prev => ({
            ...prev,
            [field]: [...prev[field], defaultValue]
        }));
    };

    const removeArrayItem = (field, index) => {
        setProfile(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const updateArrayItem = (field, index, value) => {
        setProfile(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? value : item)
        }));
    };

    if (!user) {
        return (
            <div className="flex-1 lg:ml-64 bg-[#f3f2ef] min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Sign in to view your profile</h2>
                    <a href="/login" className="btn-primary px-8 py-3 rounded-xl inline-block mt-4">Sign In</a>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 lg:ml-64 bg-[#f3f2ef] dark:bg-slate-900 min-h-screen">
            <div className="max-w-5xl mx-auto p-4 lg:p-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">My Profile</h1>
                        <p className="text-slate-500 dark:text-slate-400">Manage your personal information and preferences</p>
                    </div>
                    <button
                        onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                        disabled={loading}
                        className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                        {isEditing ? <Save className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                        {isEditing ? 'Save Changes' : 'Edit Profile'}
                    </button>
                </div>

                {/* Basic Info */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        Basic Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-bold text-slate-600 dark:text-slate-400 dark:text-slate-400 mb-2 block">Full Name</label>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                disabled={!isEditing}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-primary-500 dark:focus:border-primary-400 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-700 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 block">Email</label>
                            <input
                                type="email"
                                value={profile.email}
                                disabled
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 block">Current Role</label>
                            <input
                                type="text"
                                value={profile.role}
                                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                                disabled={!isEditing}
                                placeholder="e.g. Full Stack Developer"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-primary-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-700 dark:bg-slate-700 dark:text-white\"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 block">Professional Summary</label>
                            <textarea
                                value={profile.summary}
                                onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                                disabled={!isEditing}
                                rows={3}
                                placeholder="Brief professional summary..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-primary-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-700 dark:bg-slate-700 dark:text-white\"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className=\"bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-sm border border-slate-200 dark:border-slate-700\">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400\" />
                        Contact Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 block">Phone</label>
                            <input
                                type="tel"
                                value={profile.contact.phone || ''}
                                onChange={(e) => setProfile({ ...profile, contact: { ...profile.contact, phone: e.target.value } })}
                                disabled={!isEditing}
                                placeholder="+1234567890"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-primary-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-700 dark:bg-slate-700 dark:text-white\"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 block">Location</label>
                            <input
                                type="text"
                                value={profile.contact.location || ''}
                                onChange={(e) => setProfile({ ...profile, contact: { ...profile.contact, location: e.target.value } })}
                                disabled={!isEditing}
                                placeholder="City, Country"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-primary-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-700 dark:bg-slate-700 dark:text-white\"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 block">LinkedIn</label>
                            <input
                                type="url"
                                value={profile.contact.linkedin || ''}
                                onChange={(e) => setProfile({ ...profile, contact: { ...profile.contact, linkedin: e.target.value } })}
                                disabled={!isEditing}
                                placeholder="linkedin.com/in/username"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-primary-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-700 dark:bg-slate-700 dark:text-white\"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 block">GitHub</label>
                            <input
                                type="url"
                                value={profile.contact.github || ''}
                                onChange={(e) => setProfile({ ...profile, contact: { ...profile.contact, github: e.target.value } })}
                                disabled={!isEditing}
                                placeholder="github.com/username"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-primary-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-700 dark:bg-slate-700 dark:text-white\"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 block">Portfolio Website</label>
                            <input
                                type="url"
                                value={profile.contact.portfolio || ''}
                                onChange={(e) => setProfile({ ...profile, contact: { ...profile.contact, portfolio: e.target.value } })}
                                disabled={!isEditing}
                                placeholder="https://yourportfolio.com"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-primary-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-700 dark:bg-slate-700 dark:text-white\"
                            />
                        </div>
                    </div>
                </div>

                {/* Skills */}
                <div className=\"bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-sm border border-slate-200 dark:border-slate-700\">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Code className="w-5 h-5 text-primary-600 dark:text-primary-400\" />
                            Skills
                        </h2>
                        {isEditing && (
                            <button
                                onClick={() => addArrayItem('skills', '')}
                                className="text-primary-600 hover:text-primary-700 font-bold text-sm flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Add Skill
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, index) => (
                            <div key={index} className="flex items-center gap-2 bg-primary-50 border border-primary-200 px-3 py-2 rounded-lg">
                                {isEditing ? (
                                    <>
                                        <input
                                            type="text"
                                            value={skill}
                                            onChange={(e) => updateArrayItem('skills', index, e.target.value)}
                                            className="bg-transparent outline-none text-sm font-bold text-primary-700 w-24"
                                        />
                                        <button onClick={() => removeArrayItem('skills', index)} className="text-primary-700 hover:text-red-600">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <span className="text-sm font-bold text-primary-700">{skill}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Education */}
                <div className=\"bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-sm border border-slate-200 dark:border-slate-700\">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-primary-600 dark:text-primary-400\" />
                            Education
                        </h2>
                        {isEditing && (
                            <button
                                onClick={() => addArrayItem('education', { degree: '', institution: '', year: '', grade: '' })}
                                className="text-primary-600 hover:text-primary-700 font-bold text-sm flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Add Education
                            </button>
                        )}
                    </div>
                    <div className="space-y-4">
                        {profile.education.length === 0 ? (
                            <p className="text-slate-400 text-sm italic">No education information added yet. Upload your resume to auto-populate this section.</p>
                        ) : (
                            profile.education.map((edu, index) => (
                                <div key={index} className="border border-slate-200 rounded-xl p-4 hover:border-primary-200 transition-all">
                                    {isEditing ? (
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-2">
                                                <div className="flex-1 space-y-3">
                                                    <input
                                                        type="text"
                                                        value={edu.degree || ''}
                                                        onChange={(e) => updateArrayItem('education', index, { ...edu, degree: e.target.value })}
                                                        placeholder="Degree (e.g. B.Tech in Computer Science)"
                                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={edu.institution || ''}
                                                        onChange={(e) => updateArrayItem('education', index, { ...edu, institution: e.target.value })}
                                                        placeholder="Institution Name"
                                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                                    />
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input
                                                            type="text"
                                                            value={edu.year || ''}
                                                            onChange={(e) => updateArrayItem('education', index, { ...edu, year: e.target.value })}
                                                            placeholder="Year (e.g. 2020-2024)"
                                                            className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={edu.grade || ''}
                                                            onChange={(e) => updateArrayItem('education', index, { ...edu, grade: e.target.value })}
                                                            placeholder="GPA/Grade (optional)"
                                                            className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeArrayItem('education', index)}
                                                    className="text-red-600 hover:text-red-700 p-2"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <h3 className="font-bold text-slate-900">{edu.degree}</h3>
                                            <p className="text-sm text-slate-600 mt-1">{edu.institution}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                                <span>{edu.year}</span>
                                                {edu.grade && <span>• {edu.grade}</span>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Experience */}
                <div className=\"bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-sm border border-slate-200 dark:border-slate-700\">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-primary-600 dark:text-primary-400\" />
                            Work Experience
                        </h2>
                        {isEditing && (
                            <button
                                onClick={() => addArrayItem('experience', { title: '', company: '', duration: '', description: '', location: '' })}
                                className="text-primary-600 hover:text-primary-700 font-bold text-sm flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Add Experience
                            </button>
                        )}
                    </div>
                    <div className="space-y-4">
                        {profile.experience.length === 0 ? (
                            <p className="text-slate-400 text-sm italic">No work experience added yet. Upload your resume to auto-populate this section.</p>
                        ) : (
                            profile.experience.map((exp, index) => (
                                <div key={index} className="border border-slate-200 rounded-xl p-4 hover:border-primary-200 transition-all">
                                    {isEditing ? (
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-2">
                                                <div className="flex-1 space-y-3">
                                                    <input
                                                        type="text"
                                                        value={exp.title || ''}
                                                        onChange={(e) => updateArrayItem('experience', index, { ...exp, title: e.target.value })}
                                                        placeholder="Job Title"
                                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold"
                                                    />
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input
                                                            type="text"
                                                            value={exp.company || ''}
                                                            onChange={(e) => updateArrayItem('experience', index, { ...exp, company: e.target.value })}
                                                            placeholder="Company Name"
                                                            className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={exp.location || ''}
                                                            onChange={(e) => updateArrayItem('experience', index, { ...exp, location: e.target.value })}
                                                            placeholder="Location (optional)"
                                                            className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                                        />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={exp.duration || ''}
                                                        onChange={(e) => updateArrayItem('experience', index, { ...exp, duration: e.target.value })}
                                                        placeholder="Duration (e.g. Jan 2022 - Present)"
                                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                                    />
                                                    <textarea
                                                        value={exp.description || ''}
                                                        onChange={(e) => updateArrayItem('experience', index, { ...exp, description: e.target.value })}
                                                        placeholder="Key responsibilities and achievements..."
                                                        rows={3}
                                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => removeArrayItem('experience', index)}
                                                    className="text-red-600 hover:text-red-700 p-2"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <h3 className="font-bold text-slate-900">{exp.title}</h3>
                                            <p className="text-sm text-primary-600 mt-1">{exp.company}</p>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                                <span>{exp.duration}</span>
                                                {exp.location && <><span>•</span><span>{exp.location}</span></>}
                                            </div>
                                            {exp.description && (
                                                <p className="text-sm text-slate-600 mt-3 leading-relaxed">{exp.description}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Internships */}
                <div className=\"bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-sm border border-slate-200 dark:border-slate-700\">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Award className="w-5 h-5 text-primary-600 dark:text-primary-400\" />
                            Internships
                        </h2>
                        {isEditing && (
                            <button
                                onClick={() => addArrayItem('internships', { title: '', company: '', duration: '', description: '', location: '' })}
                                className="text-primary-600 hover:text-primary-700 font-bold text-sm flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Add Internship
                            </button>
                        )}
                    </div>
                    <div className="space-y-4">
                        {profile.internships.length === 0 ? (
                            <p className="text-slate-400 text-sm italic">No internships added yet. Upload your resume to auto-populate this section.</p>
                        ) : (
                            profile.internships.map((intern, index) => (
                                <div key={index} className="border border-slate-200 rounded-xl p-4 hover:border-primary-200 transition-all">
                                    {isEditing ? (
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-2">
                                                <div className="flex-1 space-y-3">
                                                    <input
                                                        type="text"
                                                        value={intern.title || ''}
                                                        onChange={(e) => updateArrayItem('internships', index, { ...intern, title: e.target.value })}
                                                        placeholder="Role/Position"
                                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold"
                                                    />
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input
                                                            type="text"
                                                            value={intern.company || ''}
                                                            onChange={(e) => updateArrayItem('internships', index, { ...intern, company: e.target.value })}
                                                            placeholder="Company Name"
                                                            className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={intern.duration || ''}
                                                            onChange={(e) => updateArrayItem('internships', index, { ...intern, duration: e.target.value })}
                                                            placeholder="Duration"
                                                            className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                                        />
                                                    </div>
                                                    <textarea
                                                        value={intern.description || ''}
                                                        onChange={(e) => updateArrayItem('internships', index, { ...intern, description: e.target.value })}
                                                        placeholder="Work done and learnings..."
                                                        rows={2}
                                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => removeArrayItem('internships', index)}
                                                    className="text-red-600 hover:text-red-700 p-2"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <h3 className="font-bold text-slate-900">{intern.title}</h3>
                                            <p className="text-sm text-primary-600 mt-1">{intern.company}</p>
                                            <p className="text-xs text-slate-500 mt-2">{intern.duration}</p>
                                            {intern.description && (
                                                <p className="text-sm text-slate-600 mt-3 leading-relaxed">{intern.description}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Languages & Hobbies */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className=\"bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700\">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-primary-600 dark:text-primary-400\" />
                                Languages
                            </h2>
                            {isEditing && (
                                <button onClick={() => addArrayItem('languages', '')} className="text-primary-600 text-sm font-bold">
                                    <Plus className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <div className="space-y-2">
                            {profile.languages.map((lang, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    {isEditing ? (
                                        <>
                                            <input
                                                type="text"
                                                value={lang}
                                                onChange={(e) => updateArrayItem('languages', index, e.target.value)}
                                                placeholder="e.g. English - Fluent"
                                                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                            />
                                            <button onClick={() => removeArrayItem('languages', index)} className="text-red-600">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <span className="text-sm text-slate-700 dark:text-slate-300\">{lang}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className=\"bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700\">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Heart className="w-5 h-5 text-primary-600 dark:text-primary-400\" />
                                Hobbies
                            </h2>
                            {isEditing && (
                                <button onClick={() => addArrayItem('hobbies', '')} className="text-primary-600 text-sm font-bold">
                                    <Plus className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <div className="space-y-2">
                            {profile.hobbies.map((hobby, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    {isEditing ? (
                                        <>
                                            <input
                                                type="text"
                                                value={hobby}
                                                onChange={(e) => updateArrayItem('hobbies', index, e.target.value)}
                                                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                                            />
                                            <button onClick={() => removeArrayItem('hobbies', index)} className="text-red-600">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <span className="text-sm text-slate-700 dark:text-slate-300\">{hobby}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Password Change */}
                <div className=\"bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6 shadow-sm border border-slate-200 dark:border-slate-700\">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-primary-600 dark:text-primary-400\" />
                        Change Password
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="password"
                            placeholder="Current Password"
                            value={passwords.currentPassword}
                            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                            className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-primary-500 outline-none"
                        />
                        <input
                            type="password"
                            placeholder="New Password"
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                            className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-primary-500 outline-none"
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                            className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:border-primary-500 outline-none"
                        />
                    </div>
                    <button
                        onClick={handlePasswordChange}
                        disabled={loading || !passwords.currentPassword || !passwords.newPassword}
                        className="mt-4 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                        Update Password
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;

