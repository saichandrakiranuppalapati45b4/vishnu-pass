import React, { useState } from 'react';
import { HelpCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

const LoginScreen = ({ onLogin, branding }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Sign in with Supabase Auth
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password,
            });

            if (authError) {
                setError(authError.message);
                setLoading(false);
                return;
            }

            // Verify the user is an admin
            const { data: adminData, error: adminError } = await supabase
                .from('admins')
                .select('*')
                .eq('email', email.trim())
                .single();

            if (adminError || !adminData) {
                setError('Access denied. You are not an admin.');
                await supabase.auth.signOut();
                setLoading(false);
                return;
            }

            onLogin();
        } catch (err) {
            setError('Something went wrong. Please try again.');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#f9fafb] flex flex-col font-sans">

            {/* Header */}
            <header className="flex justify-between items-center p-4 bg-[#f9fafb]">
                <div className="flex items-center gap-2">
                    {/* Portal Logo */}
                    <div className="bg-[#fef3c7] w-10 h-10 rounded-lg flex items-center justify-center border border-orange-100 overflow-hidden">
                        {branding?.portalLogo ? (
                            <img src={branding.portalLogo} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L3 7L3 11C3 16.5 6.8 21.5 12 23C17.2 21.5 21 16.5 21 11L21 7L12 2Z" fill="#F47C20" opacity="0.3" />
                                <path d="M12 22C17 20.5 20 16 20 11V7.5L12 3L4 7.5V11C4 16 7 20.5 12 22Z" fill="#F47C20" />
                                <circle cx="12" cy="11" r="3" fill="white" />
                            </svg>
                        )}
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Vishnu Pass</h1>
                </div>
                <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm font-medium">
                    Support <HelpCircle className="w-5 h-5 text-gray-400 fill-current" />
                </button>
            </header>

            {/* Main Container */}
            <div className="flex-1 px-4 pb-8 flex justify-center">
                <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col border border-gray-100 relative mt-2">

                    {/* Hero Image / Background Area */}
                    <div className="h-44 bg-gradient-to-t from-gray-100 to-gray-200 relative overflow-hidden">
                        {branding?.loginBackground ? (
                            <img src={branding.loginBackground} alt="Login Background" className="w-full h-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 opacity-10 flex flex-col justify-end items-center pointer-events-none">
                                <div className="w-3/4 h-24 border-t-8 border-l-8 border-r-8 border-gray-400 relative">
                                    <div className="absolute top-4 left-4 right-4 bottom-0 border-t-2 border-gray-400"></div>
                                </div>
                            </div>
                        )}
                        {/* Gradient overlay to blend bottom edge into white */}
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
                    </div>

                    {/* Avatar Icon Overlap */}
                    <div className="absolute top-36 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                            <div className="w-16 h-16 bg-brand-orange rounded-full flex items-center justify-center">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 4L2 9L12 14L22 9L12 4Z" fill="white" />
                                    <path d="M4 10V15C4 15 8 19 12 19C16 19 20 15 20 15V10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 pt-12 pb-6 flex-1 flex flex-col">

                        {/* Greeting */}
                        <div className="text-center mb-8">
                            <h2 className="text-[28px] font-bold text-gray-900 tracking-tight mb-2">Welcome Back</h2>
                            <p className="text-[#64748b] text-[15px]">Access your Digital Identity Portal</p>
                        </div>

                        {/* Form */}
                        <form className="flex flex-col gap-5 text-sm" onSubmit={handleSubmit}>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs font-semibold text-center">
                                    {error}
                                </div>
                            )}

                            {/* Email / Student ID */}
                            <div>
                                <label className="block text-gray-800 font-semibold mb-2">Email / ID</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
                                            <line x1="8" y1="10" x2="8" y2="10" />
                                            <line x1="12" y1="10" x2="16" y2="10" />
                                            <line x1="12" y1="14" x2="16" y2="14" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email or ID"
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange placeholder:text-gray-400 text-gray-900 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-gray-800 font-semibold">Password</label>
                                    <a href="#" className="text-brand-orange font-medium text-sm hover:underline">Forgot?</a>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange placeholder:text-gray-400 text-gray-900 transition-all font-medium tracking-widest text-lg"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center gap-2 mt-1">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    className="w-4 h-4 rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
                                />
                                <label htmlFor="remember" className="text-gray-600 text-sm font-medium">Remember this device</label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full mt-2 bg-brand-orange hover:bg-[#e06d1c] text-white font-semibold py-3.5 rounded-xl shadow-[0_4px_14px_rgba(244,124,32,0.4)] transition-colors flex items-center justify-center gap-2 text-[15px]"
                            >
                                Sign In
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </button>
                        </form>

                        {/* Badges */}
                        <div className="flex justify-center gap-4 mt-8 pb-2">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-purple/5 border border-brand-purple/10">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9C2A8C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    <path d="M9 12l2 2 4-4" />
                                </svg>
                                <span className="text-xs font-semibold text-brand-purple">Secure SSL</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-orange/5 border border-brand-orange/10">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F47C20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                                    <path d="M9 22v-4h6v4" />
                                    <path d="M8 6h.01" />
                                    <path d="M16 6h.01" />
                                    <path d="M12 6h.01" />
                                    <path d="M12 10h.01" />
                                    <path d="M12 14h.01" />
                                    <path d="M16 10h.01" />
                                    <path d="M16 14h.01" />
                                    <path d="M8 10h.01" />
                                    <path d="M8 14h.01" />
                                </svg>
                                <span className="text-xs font-semibold text-brand-orange">Campus Only</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="text-center pb-6 text-xs text-brand-blue/60 mt-auto px-4 text-[#8a9ab0]">
                <p className="mb-1 font-medium">© 2024 Vishnu Institute. All Rights Reserved.</p>
                <p className="font-medium">Powered by Vishnu Pass Digital Identity Systems</p>
            </footer>
        </div>
    );
};

export default LoginScreen;
