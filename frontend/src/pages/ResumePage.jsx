import React, { useState, useEffect } from 'react';
import { Upload, FileCheck, RefreshCw, AlertCircle, FileText, Plus, X, Trash2, Edit2, Save, User, Briefcase, GraduationCap, Code, Award, Globe, Heart, Mail, Phone, MapPin, Linkedin, Github } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

const ResumePage = () => {
    const { uploadResume, resume, api } = useApp();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [extractedText, setExtractedText] = useState('');
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        fetchResume();
    }, []);

    const fetchResume = async () => {
        try {
            const res = await api.get('/resume');
            setExtractedText(res.data.resumeText);
            setProfile(res.data.profile);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        try {
            await uploadResume(file);
            await fetchResume();
            addToast('Resume processed successfully!', 'success');
        } catch (error) {
            const msg = error.response?.data?.error || 'Failed to upload resume';
            addToast(msg, 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            await api.post('/profile/update', { profile });
            addToast('Profile updated successfully!', 'success');
            setIsEditing(false);
        } catch (error) {
            addToast('Failed to update profile', 'error');
        }
    };

    const addArrayItem = (field, defaultValue) => {
        setProfile(prev => ({
            ...prev,
            [field]: [...(prev[field] || []), defaultValue]
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

    const updateObjectField = (field, key, value) => {
        setProfile(prev => ({
            ...prev,
            [field]: { ...(prev[field] || {}), [key]: value }
        }));
    };

    return (
        <div className="flex-1 lg:ml-64 xl:mr-96 pt-20 lg:pt-0 bg-[#f3f2ef]">
            <div className="max-w-4xl mx-auto p-4 lg:p-10">
                <header className="mb-10">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-px w-8 bg-primary-600"></div>
                        <span className="text-[10px] font-black uppercase text-primary-600 tracking-[0.2em]">Profile Center</span>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-slate-900 via-primary-700 to-slate-900 bg-clip-text text-transparent mb-2 uppercase tracking-tighter">My Resume</h2>
                    <p className="text-slate-500 text-lg font-medium">Upload your resume to enable AI-powered job matching.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <label
                            htmlFor="resume-upload"
                            className="bg-white border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 lg:p-12 text-center group hover:border-primary-500/50 hover:bg-primary-50/10 transition-all cursor-pointer rounded-2xl shadow-sm"
                        >
                            <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-100 transition-all border border-primary-100">
                                <Upload className="w-10 h-10 text-primary-600" />
                            </div>
                            <input
                                type="file"
                                id="resume-upload"
                                className="hidden"
                                onChange={(e) => setFile(e.target.files[0])}
                                accept=".pdf,.txt"
                            />
                            <span className="mb-2 font-bold text-xl text-slate-900 break-all px-4">
                                {file ? file.name : 'Select Resume'}
                            </span>
                            <p className="text-sm text-slate-400 mb-8 font-medium">PDF or TXT formats supported</p>

                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleUpload();
                                }}
                                disabled={!file || uploading}
                                className={`w-full btn-primary flex items-center justify-center gap-2 ${(!file || uploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {uploading ? (
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <FileCheck className="w-5 h-5" />
                                        Process Content
                                    </>
                                )}
                            </button>
                        </label>

                        <div className="p-6 rounded-2xl bg-primary-50 border border-primary-100 flex gap-4 shadow-sm">
                            <AlertCircle className="w-6 h-6 text-primary-600 shrink-0" />
                            <div>
                                <h4 className="font-bold text-primary-900 text-sm uppercase tracking-wider mb-1">Intelligence Note</h4>
                                <p className="text-sm text-slate-600 leading-relaxed">Our AI analyzes your experience to provide context-aware job recommendations and match scores.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl flex flex-col h-[700px] lg:h-[800px] shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileText className="w-6 h-6 text-primary-600" />
                                <h3 className="text-lg font-bold text-slate-900">Extracted Insights</h3>
                            </div>
                            {profile && (
                                <button
                                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                                    className="flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
                                >
                                    {isEditing ? (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Save
                                        </>
                                    ) : (
                                        <>
                                            <Edit2 className="w-4 h-4" />
                                            Edit
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-6">
                            {profile ? (
                                <>
                                    {/* Personal Info */}
                                    {profile.name && (
                                        <div>
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                                                <User className="w-3 h-3" />
                                                Name
                                            </h4>
                                            <p className="font-bold text-slate-800">{profile.name}</p>
                                        </div>
                                    )}

                                    {/* Role */}
                                    {profile.role && (
                                        <div>
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                                                <Briefcase className="w-3 h-3" />
                                                Role
                                            </h4>
                                            <p className="font-medium text-slate-700">{profile.role}</p>
                                        </div>
                                    )}

                                    {/* Summary */}
                                    {profile.summary && (
                                        <div>
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Summary</h4>
                                            <p className="text-sm text-slate-600 leading-relaxed">{profile.summary}</p>
                                        </div>
                                    )}

                                    {/* Contact */}
                                    {profile.contact && Object.keys(profile.contact).some(k => profile.contact[k]) && (
                                        <div>
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                                <Mail className="w-3 h-3" />
                                                Contact
                                            </h4>
                                            <div className="space-y-2">
                                                {profile.contact.email && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Mail className="w-4 h-4 text-slate-400" />
                                                        <span className="text-slate-700">{profile.contact.email}</span>
                                                    </div>
                                                )}
                                                {profile.contact.phone && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Phone className="w-4 h-4 text-slate-400" />
                                                        <span className="text-slate-700">{profile.contact.phone}</span>
                                                    </div>
                                                )}
                                                {profile.contact.location && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <MapPin className="w-4 h-4 text-slate-400" />
                                                        <span className="text-slate-700">{profile.contact.location}</span>
                                                    </div>
                                                )}
                                                {profile.contact.linkedin && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Linkedin className="w-4 h-4 text-slate-400" />
                                                        <a href={`https://${profile.contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{profile.contact.linkedin}</a>
                                                    </div>
                                                )}
                                                {profile.contact.github && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Github className="w-4 h-4 text-slate-400" />
                                                        <a href={`https://${profile.contact.github}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{profile.contact.github}</a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Skills */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                <Code className="w-3 h-3" />
                                                Skills
                                            </h4>
                                            {isEditing && (
                                                <button
                                                    onClick={() => addArrayItem('skills', '')}
                                                    className="text-primary-600 hover:text-primary-700"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.skills && profile.skills.length > 0 ? (
                                                profile.skills.map((skill, i) => (
                                                    <div key={i} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">
                                                        {isEditing ? (
                                                            <>
                                                                <input
                                                                    type="text"
                                                                    value={skill}
                                                                    onChange={(e) => updateArrayItem('skills', i, e.target.value)}
                                                                    className="bg-transparent outline-none w-20"
                                                                />
                                                                <button onClick={() => removeArrayItem('skills', i)} className="text-red-600 hover:text-red-700">
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span>{skill}</span>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-sm text-slate-400 italic">No skills detected</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Experience */}
                                    {profile.experience && profile.experience.length > 0 && (
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                    <Briefcase className="w-3 h-3" />
                                                    Experience
                                                </h4>
                                                {isEditing && (
                                                    <button
                                                        onClick={() => addArrayItem('experience', { title: '', company: '', duration: '', description: '' })}
                                                        className="text-primary-600 hover:text-primary-700"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="space-y-3">
                                                {profile.experience.map((exp, i) => (
                                                    <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                        {isEditing ? (
                                                            <div className="space-y-2">
                                                                <input
                                                                    type="text"
                                                                    value={exp.title || exp}
                                                                    onChange={(e) => updateArrayItem('experience', i, typeof exp === 'string' ? e.target.value : { ...exp, title: e.target.value })}
                                                                    placeholder="Job Title"
                                                                    className="w-full px-2 py-1 text-sm rounded border border-slate-200"
                                                                />
                                                                {typeof exp === 'object' && (
                                                                    <>
                                                                        <input
                                                                            type="text"
                                                                            value={exp.company || ''}
                                                                            onChange={(e) => updateArrayItem('experience', i, { ...exp, company: e.target.value })}
                                                                            placeholder="Company"
                                                                            className="w-full px-2 py-1 text-sm rounded border border-slate-200"
                                                                        />
                                                                        <input
                                                                            type="text"
                                                                            value={exp.duration || ''}
                                                                            onChange={(e) => updateArrayItem('experience', i, { ...exp, duration: e.target.value })}
                                                                            placeholder="Duration"
                                                                            className="w-full px-2 py-1 text-sm rounded border border-slate-200"
                                                                        />
                                                                    </>
                                                                )}
                                                                <button onClick={() => removeArrayItem('experience', i)} className="text-red-600 text-xs font-bold flex items-center gap-1">
                                                                    <Trash2 className="w-3 h-3" />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm text-slate-700">
                                                                {typeof exp === 'string' ? (
                                                                    <p className="font-medium">{exp}</p>
                                                                ) : (
                                                                    <>
                                                                        <p className="font-bold text-slate-900">{exp.title}</p>
                                                                        {exp.company && <p className="text-slate-600">{exp.company}</p>}
                                                                        {exp.duration && <p className="text-xs text-slate-500">{exp.duration}</p>}
                                                                        {exp.description && <p className="text-xs mt-1">{exp.description}</p>}
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Education */}
                                    {profile.education && profile.education.length > 0 && (
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                    <GraduationCap className="w-3 h-3" />
                                                    Education
                                                </h4>
                                                {isEditing && (
                                                    <button
                                                        onClick={() => addArrayItem('education', { degree: '', institution: '', year: '' })}
                                                        className="text-primary-600 hover:text-primary-700"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                {profile.education.map((edu, i) => (
                                                    <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm">
                                                        {isEditing ? (
                                                            <div className="space-y-2">
                                                                <input
                                                                    type="text"
                                                                    value={edu.degree || edu}
                                                                    onChange={(e) => updateArrayItem('education', i, typeof edu === 'string' ? e.target.value : { ...edu, degree: e.target.value })}
                                                                    placeholder="Degree"
                                                                    className="w-full px-2 py-1 text-sm rounded border border-slate-200"
                                                                />
                                                                <button onClick={() => removeArrayItem('education', i)} className="text-red-600 text-xs font-bold flex items-center gap-1">
                                                                    <Trash2 className="w-3 h-3" />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="text-slate-700">
                                                                {typeof edu === 'string' ? (
                                                                    <p className="font-medium">{edu}</p>
                                                                ) : (
                                                                    <>
                                                                        <p className="font-bold text-slate-900">{edu.degree}</p>
                                                                        {edu.institution && <p className="text-slate-600">{edu.institution}</p>}
                                                                        {edu.year && <p className="text-xs text-slate-500">{edu.year}</p>}
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Projects */}
                                    {profile.projects && profile.projects.length > 0 && (
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                    <Code className="w-3 h-3" />
                                                    Projects
                                                </h4>
                                                {isEditing && (
                                                    <button
                                                        onClick={() => addArrayItem('projects', { title: '', description: '', techStack: [] })}
                                                        className="text-primary-600 hover:text-primary-700"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                {profile.projects.map((proj, i) => (
                                                    <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm">
                                                        {isEditing ? (
                                                            <div className="space-y-2">
                                                                <input
                                                                    type="text"
                                                                    value={proj.title || proj}
                                                                    onChange={(e) => updateArrayItem('projects', i, typeof proj === 'string' ? e.target.value : { ...proj, title: e.target.value })}
                                                                    placeholder="Project Title"
                                                                    className="w-full px-2 py-1 text-sm rounded border border-slate-200"
                                                                />
                                                                <button onClick={() => removeArrayItem('projects', i)} className="text-red-600 text-xs font-bold flex items-center gap-1">
                                                                    <Trash2 className="w-3 h-3" />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="text-slate-700">
                                                                <p className="font-bold text-slate-900">{proj.title || proj}</p>
                                                                {proj.description && <p className="text-xs mt-1">{proj.description}</p>}
                                                                {proj.techStack && proj.techStack.length > 0 && (
                                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                                        {proj.techStack.map((tech, ti) => (
                                                                            <span key={ti} className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded text-[10px] font-bold">{tech}</span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Internships */}
                                    {profile.internships && profile.internships.length > 0 && (
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                    <Award className="w-3 h-3" />
                                                    Internships
                                                </h4>
                                                {isEditing && (
                                                    <button
                                                        onClick={() => addArrayItem('internships', { title: '', company: '', duration: '' })}
                                                        className="text-primary-600 hover:text-primary-700"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                {profile.internships.map((intern, i) => (
                                                    <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm">
                                                        {isEditing ? (
                                                            <div className="space-y-2">
                                                                <input
                                                                    type="text"
                                                                    value={intern.title || intern}
                                                                    onChange={(e) => updateArrayItem('internships', i, typeof intern === 'string' ? e.target.value : { ...intern, title: e.target.value })}
                                                                    placeholder="Role"
                                                                    className="w-full px-2 py-1 text-sm rounded border border-slate-200"
                                                                />
                                                                <button onClick={() => removeArrayItem('internships', i)} className="text-red-600 text-xs font-bold flex items-center gap-1">
                                                                    <Trash2 className="w-3 h-3" />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="text-slate-700">
                                                                <p className="font-bold text-slate-900">{intern.title || intern}</p>
                                                                {intern.company && <p className="text-slate-600">{intern.company}</p>}
                                                                {intern.duration && <p className="text-xs text-slate-500">{intern.duration}</p>}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Certifications */}
                                    {profile.certifications && profile.certifications.length > 0 && (
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                    <Award className="w-3 h-3" />
                                                    Certifications
                                                </h4>
                                                {isEditing && (
                                                    <button
                                                        onClick={() => addArrayItem('certifications', { name: '', issuer: '', date: '' })}
                                                        className="text-primary-600 hover:text-primary-700"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                {profile.certifications.map((cert, i) => (
                                                    <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm">
                                                        {isEditing ? (
                                                            <div className="space-y-2">
                                                                <input
                                                                    type="text"
                                                                    value={cert.name || cert}
                                                                    onChange={(e) => updateArrayItem('certifications', i, typeof cert === 'string' ? e.target.value : { ...cert, name: e.target.value })}
                                                                    placeholder="Certification Name"
                                                                    className="w-full px-2 py-1 text-sm rounded border border-slate-200"
                                                                />
                                                                <button onClick={() => removeArrayItem('certifications', i)} className="text-red-600 text-xs font-bold flex items-center gap-1">
                                                                    <Trash2 className="w-3 h-3" />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="text-slate-700">
                                                                <p className="font-bold text-slate-900">{cert.name || cert}</p>
                                                                {cert.issuer && <p className="text-slate-600">{cert.issuer}</p>}
                                                                {cert.date && <p className="text-xs text-slate-500">{cert.date}</p>}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Languages */}
                                    {profile.languages && profile.languages.length > 0 && (
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                    <Globe className="w-3 h-3" />
                                                    Languages
                                                </h4>
                                                {isEditing && (
                                                    <button
                                                        onClick={() => addArrayItem('languages', '')}
                                                        className="text-primary-600 hover:text-primary-700"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {profile.languages.map((lang, i) => (
                                                    <div key={i} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-100">
                                                        {isEditing ? (
                                                            <>
                                                                <input
                                                                    type="text"
                                                                    value={lang}
                                                                    onChange={(e) => updateArrayItem('languages', i, e.target.value)}
                                                                    className="bg-transparent outline-none w-24"
                                                                />
                                                                <button onClick={() => removeArrayItem('languages', i)} className="text-red-600">
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span>{lang}</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Hobbies */}
                                    {profile.hobbies && profile.hobbies.length > 0 && (
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                    <Heart className="w-3 h-3" />
                                                    Hobbies
                                                </h4>
                                                {isEditing && (
                                                    <button
                                                        onClick={() => addArrayItem('hobbies', '')}
                                                        className="text-primary-600 hover:text-primary-700"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {profile.hobbies.map((hobby, i) => (
                                                    <div key={i} className="flex items-center gap-1 px-3 py-1.5 bg-pink-50 text-pink-700 rounded-lg text-xs font-bold border border-pink-100">
                                                        {isEditing ? (
                                                            <>
                                                                <input
                                                                    type="text"
                                                                    value={hobby}
                                                                    onChange={(e) => updateArrayItem('hobbies', i, e.target.value)}
                                                                    className="bg-transparent outline-none w-20"
                                                                />
                                                                <button onClick={() => removeArrayItem('hobbies', i)} className="text-red-600">
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span>{hobby}</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Raw Text Toggle */}
                                    <div className="pt-6 border-t border-slate-100">
                                        <details className="group">
                                            <summary className="flex items-center gap-2 text-xs font-bold text-slate-500 cursor-pointer hover:text-primary-600 transition-colors list-none">
                                                <span>View Raw Extracted Text</span>
                                            </summary>
                                            <pre className="mt-4 text-[10px] text-slate-500 whitespace-pre-wrap font-mono bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
                                                {extractedText}
                                            </pre>
                                        </details>
                                    </div>
                                </>
                            ) : extractedText ? (
                                <pre className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed font-mono bg-slate-50 p-6 rounded-xl border border-slate-100">
                                    {extractedText}
                                </pre>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 px-6 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <FileText className="w-8 h-8 opacity-20" />
                                    </div>
                                    <p className="text-sm font-medium">No resume content found.<br />Upload a file to start AI matching.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumePage;
