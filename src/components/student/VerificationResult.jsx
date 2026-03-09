import React from 'react';
import { ChevronLeft, CheckCircle2, GraduationCap, MapPin, Clock, Home, ArrowRight, Zap } from 'lucide-react';

const VerificationResult = ({ studentData, gateName, verifiedAt, onNextScan }) => {
    return (
        <div className="flex-1 flex flex-col bg-[#f8f9fb] animate-in slide-in-from-bottom-4 duration-500 overflow-hidden font-sans">
            {/* Header */}
            <div className="px-6 py-6 flex items-center justify-between bg-white border-b border-gray-100">
                <button
                    onClick={onNextScan}
                    className="w-10 h-10 flex items-center justify-center text-[#f47c20] hover:bg-orange-50 rounded-full transition-colors"
                >
                    <ChevronLeft className="w-7 h-7" />
                </button>
                <h2 className="text-xl font-bold text-[#1e293b] tracking-tight">Security Verification</h2>
                <div className="w-10" />
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-10">
                {/* Student Profile Card */}
                <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                        <div className="w-44 h-44 rounded-[40px] overflow-hidden shadow-2xl shadow-blue-900/10 border-[6px] border-white">
                            {studentData?.photo_url ? (
                                <img src={studentData.photo_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-300 font-bold text-5xl">
                                    {studentData?.full_name?.[0]}
                                </div>
                            )}
                        </div>
                        {/* Verified Badge */}
                        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-[#10b981] rounded-full border-[4px] border-[#f8f9fb] flex items-center justify-center shadow-lg">
                            <CheckCircle2 className="w-6 h-6 text-white fill-white/20" />
                        </div>
                    </div>

                    <h1 className="text-4xl font-black text-[#1a2b4b] tracking-tight mb-2">
                        {studentData?.full_name || 'Rahul Sharma'}
                    </h1>
                    <p className="text-xl font-black text-[#f47c20] tracking-widest uppercase mb-2">
                        ID: {studentData?.student_id || 'VP-2023-8842'}
                    </p>
                    <p className="text-lg font-bold text-slate-400">
                        {studentData?.departments?.name || 'Computer Science Engineering'}
                    </p>
                </div>

                {/* Status Indicator Block */}
                <div className="mt-10 bg-[#f0fff4] border border-[#d1fae5] rounded-[40px] p-8 text-center shadow-sm">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-[#10b981] flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-black text-[#065f46] tracking-tight uppercase">Valid Pass</span>
                    </div>
                    <p className="text-sm font-bold text-[#10b981]/80 mb-6 uppercase tracking-wider">
                        Verified at {verifiedAt || '10:45 AM today'}
                    </p>
                    <div className="inline-block bg-[#10b981] text-white px-10 py-3.5 rounded-2xl text-[13px] font-black tracking-[0.2em] uppercase shadow-xl shadow-emerald-500/30">
                        Green Status
                    </div>
                </div>

                {/* Details Section */}
                <div className="mt-12 space-y-8 px-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-[#fff5ef] flex items-center justify-center text-[#f47c20]">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Batch</span>
                        </div>
                        <span className="text-lg font-black text-[#1e293b]">{studentData?.batch || '2021-2025'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-[#fff5ef] flex items-center justify-center text-[#f47c20]">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Entry Point</span>
                        </div>
                        <span className="text-lg font-black text-[#1e293b]">{gateName || 'Main Gate 1'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-[#fff5ef] flex items-center justify-center text-[#f47c20]">
                                <Clock className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Validity</span>
                        </div>
                        <span className="text-lg font-black text-[#1e293b]">Expires 06:00 PM</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-[#fff5ef] flex items-center justify-center text-[#f47c20]">
                                <Home className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Hostel</span>
                        </div>
                        <span className="text-lg font-black text-[#1e293b]">{studentData?.hostel_type || 'Block B - Room 402'}</span>
                    </div>
                </div>

                {/* Action Controls */}
                <div className="mt-14 space-y-5">
                    <button
                        onClick={onNextScan}
                        className="w-full py-6 bg-[#f47c20] text-white font-black rounded-3xl shadow-2xl shadow-orange-500/30 flex items-center justify-center gap-4 active:scale-[0.97] transition-all hover:bg-[#e06d1c] text-lg"
                    >
                        <Zap className="w-6 h-6 fill-white" />
                        Next Scan
                    </button>
                    <button
                        className="w-full py-6 bg-[#fff5ec] text-[#f47c20] font-black rounded-3xl border-2 border-[#f47c20]/10 hover:bg-[#ffedda] transition-colors text-lg"
                    >
                        Manual Entry
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerificationResult;
