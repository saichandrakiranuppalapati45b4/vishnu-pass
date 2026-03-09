import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, Loader2, CheckCircle2, ChevronLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const SecuritySettings = ({ onBack }) => {
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (passwords.new !== passwords.confirm) {
            setError("New passwords do not match.");
            return;
        }

        if (passwords.new.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setIsSubmitting(true);

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: passwords.new
            });

            if (updateError) throw updateError;

            setSuccess(true);
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (err) {
            console.error("Error updating password:", err);
            setError(err.message || "Failed to update password.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f8f9fb]">
            {/* Header */}
            <div className="bg-[#1e293b] px-6 pt-12 pb-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#f47c20]/10 rounded-full -mr-20 -mt-20 blur-3xl" />

                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-white/60 font-bold text-xs uppercase tracking-widest mb-6 hover:text-white transition-colors relative z-10"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Profile
                </button>

                <div className="relative z-10">
                    <h2 className="text-2xl font-black text-white tracking-tight">Security & Privacy</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Manage your credentials</p>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 -mt-12 relative z-20 pb-10">
                <form onSubmit={handlePasswordChange} className="bg-white rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 p-8 space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-[#f47c20]">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800">Change Password</h3>
                            <p className="text-xs text-slate-400 font-medium tracking-tight">Update your portal access key</p>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold flex items-center gap-3 animate-in fade-in zoom-in-95">
                            <Shield className="w-4 h-4 opacity-50" />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 text-xs font-bold flex items-center gap-3 animate-in fade-in zoom-in-95">
                            <CheckCircle2 className="w-4 h-4 opacity-50" />
                            Password updated successfully!
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Current Password - Optional check if we want, but Supabase auth manages this or we rely on session */}
                        {/* <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Current Password</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.current ? "text" : "password"}
                                    value={passwords.current}
                                    onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                                    className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#f47c20]/30 outline-none text-sm font-bold transition-all"
                                    placeholder="••••••••"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                                >
                                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div> */}

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.new ? "text" : "password"}
                                    value={passwords.new}
                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#f47c20]/30 outline-none text-sm font-bold transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                                >
                                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Confirm New Password</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.confirm ? "text" : "password"}
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#f47c20]/30 outline-none text-sm font-bold transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                                >
                                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-5 bg-slate-900 text-white font-black rounded-[30px] flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                        {isSubmitting ? "UPDATING PASSWORD..." : "UPDATE ACCESS KEY"}
                    </button>
                </form>

                <div className="mt-8 p-6 bg-blue-50/50 rounded-[40px] border border-blue-50 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-blue-900">Security Tip</p>
                        <p className="text-[10px] text-blue-700 font-medium leading-relaxed mt-1">
                            Use a strong password with at least 8 characters, including symbols and numbers. Avoid using common phrases or personal info like birthdays.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettings;
