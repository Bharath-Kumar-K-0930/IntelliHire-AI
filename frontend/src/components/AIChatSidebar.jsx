import React, { useState } from 'react';
import { Send, X, MessageSquare, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const AIChatSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]);
    const { api, fetchJobs } = useApp();
    const navigate = useNavigate();

    const handleSend = async () => {
        if (!message.trim()) return;

        const userMsg = { role: 'user', content: message };
        setChat(prev => [...prev, userMsg]);
        setMessage('');

        try {
            const res = await api.post('/chat', { message });
            const { text, action } = res.data;

            setChat(prev => [...prev, { role: 'ai', content: text }]);

            if (action) {
                if (action.type === 'FILTER') {
                    // console.log("Applying filters:", action.payload);
                    await fetchJobs(action.payload);
                    // navigate('/jobs'); // Ensure user sees the results
                } else if (action.type === 'NAVIGATE') {
                    navigate(action.payload.path);
                    setIsOpen(false); // Close sidebar on navigation
                }
            }
        } catch (error) {
            console.error(error);
            setChat(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-50 text-white"
            >
                <MessageSquare className="w-6 h-6" />
            </button>

            {isOpen && (
                <div className="fixed top-0 right-0 w-96 h-screen bg-slate-50 border-l border-slate-200 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
                    <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary-600" />
                            <h2 className="font-bold text-lg text-slate-900">IntelliHire AI Assistant</h2>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {chat.length === 0 && (
                            <div className="text-center text-slate-500 mt-10">
                                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                                    <Sparkles className="w-8 h-8 text-primary-500" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-1">How can I help you?</h3>
                                <p className="text-xs">Ask me about jobs or how matching works.</p>
                            </div>
                        )}
                        {chat.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${msg.role === 'user'
                                    ? 'bg-primary-600 text-white rounded-tr-none'
                                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                                    }`}>
                                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-white border-t border-slate-200">
                        <div className="relative">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask me anything..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                            />
                            <button
                                onClick={handleSend}
                                className="absolute right-2 top-1.5 p-1.5 bg-primary-600 rounded-lg hover:bg-primary-700 transition-all text-white shadow-md shadow-primary-600/20"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIChatSidebar;
