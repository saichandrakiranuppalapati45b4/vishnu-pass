import React from 'react';
import { ChevronLeft, CheckCircle2, GraduationCap, MapPin, Clock, Home, ArrowRight } from 'lucide-react';

const VerificationResult = ({ studentData, gateName, verifiedAt, onNextScan }) => {
    return (
        <div className="flex-1 flex flex-col bg-[#f8f9fb] animate-in fade-in duration-500">
            {/* Header */}
            <div className="px-6 py-6 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-20">
                <button onClick={onNextScan} className="w-10 h-10 flex items-center justify-center text-[#f47c20]">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h2 className="text-lg font-black text-[#1e293b] tracking-tight">Security Verification</h2>
                <div className="w-10" /> {/* Spacer */}
            </div>

            <div className="flex-1 overflow-y-auto pb-10 px-8">
                {/* Student Profile */}
                <div className="mt-8 flex flex-col items-center text-center">
                    <div className="relative mb-6">
                        <div className="w-36 h-36 rounded-[40px] overflow-hidden shadow-2xl shadow-blue-900/10 border-4 border-white">
                            {studentData?.photo_url ? (
                                <img src={studentData.photo_url} alt="Student" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-500 font-bold text-4xl">
                                    {studentData?.full_name?.[0] || 'S'}
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-2xl border-4 border-[#f8f9fb] shadow-lg">
                            <CheckCircle2 className="w-6 h-6 fill-white text-emerald-500" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-black text-[#0f172a] tracking-tight mb-2">
                        {studentData?.full_name || 'Student Name'}
                    </h1>
                    <p className="text-lg font-black text-[#f47c20] tracking-widest uppercase mb-1">
                        ID: {studentData?.student_id || 'VP-0000-0000'}
                    </p>
                    <p className="text-sm font-bold text-slate-400 capitalize">
                        {studentData?.departments?.name || 'Academic Department'}
                    </p>
                </div>

                {/* Status Card */}
                <div className="mt-8 bg-[#f0fff4] border border-emerald-100 rounded-[32px] p-6 text-center shadow-sm">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        <span className="text-lg font-black text-emerald-600 tracking-tight uppercase">Valid Pass</span>
                    </div>
                    <p className="text-xs font-bold text-emerald-500/70 mb-4 tracking-wide uppercase">
                        Verified at {verifiedAt || '10:45 AM today'}
                    </p>
                    <div className="inline-block bg-[#10b981] text-white px-8 py-2.5 rounded-2xl text-xs font-black tracking-widest uppercase shadow-lg shadow-emerald-500/20">
                        Green Status
                    </div>
                </div>

                {/* Details List */}
                <div className="mt-10 space-y-6">
                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-4 text-slate-400">
                            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#f47c20] group-hover:scale-110 transition-transform">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-[#64748b]">Batch</span>
                        </div>
                        <span className="text-sm font-black text-[#1e293b]">{studentData?.batch || studentData?.year_of_study || '2021-2025'}</span>
                    </div>

                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-4 text-slate-400">
                            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#f47c20] group-hover:scale-110 transition-transform">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-[#64748b]">Entry Point</span>
                        </div>
                        <span className="text-sm font-black text-[#1e293b]">{gateName || 'Main Gate 1'}</span>
                    </div>

                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-4 text-slate-400">
                            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#f47c20] group-hover:scale-110 transition-transform">
                                <Clock className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-[#64748b]">Validity</span>
                        </div>
                        <span className="text-sm font-black text-[#1e293b]">Expires 06:00 PM</span>
                    </div>

                    <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-4 text-slate-400">
                            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#f47c20] group-hover:scale-110 transition-transform">
                                <Home className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-[#64748b]">Hostel</span>
                        </div>
                        <span className="text-sm font-black text-[#1e293b]">{studentData?.hostel_type || 'Main Campus'}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-10 space-y-4">
                    <button
                        onClick={onNextScan}
                        className="w-full py-5 bg-[#f47c20] text-white font-black rounded-3xl shadow-xl shadow-[#f47c20]/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all hover:brightness-110"
                    >
                        <ArrowRight className="w-5 h-5" />
                        Next Scan
                    </button>
                    <button
                        className="w-full py-5 bg-[#fff7f0] text-[#f47c20] font-black rounded-3xl border border-[#f47c20]/10 hover:bg-[#fff0e5] transition-colors"
                    >
                        Manual Entry
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerificationResult;
