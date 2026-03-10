import React from 'react';
import { ChevronLeft, CheckCircle2, GraduationCap, MapPin, Clock, Home, Zap, Download } from 'lucide-react';

const VerificationResult = ({ studentData, gateName, verifiedAt, onNextScan }) => {
    const handleDownload = () => {
        // Simulation of pass download
        const passContent = `
            VISHNU PASS
            Name: ${studentData?.full_name}
            ID: ${studentData?.student_id}
            Status: VERIFIED
            Date: ${verifiedAt || new Date().toLocaleTimeString()}
        `;
        const blob = new Blob([passContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Pass_${studentData?.student_id || 'Student'}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex-1 flex flex-col bg-[#f8f9fb] animate-in slide-in-from-bottom duration-500 overflow-hidden font-sans min-h-screen">
            {/* Header */}
            <div className="px-6 py-6 flex items-center bg-white/80 backdrop-blur-md sticky top-0 z-50 justify-between border-b border-gray-50">
                <button
                    onClick={onNextScan}
                    className="w-10 h-10 flex items-center justify-center text-[#f47c20] active:scale-90 transition-transform"
                >
                    <ChevronLeft className="w-8 h-8" />
                </button>
                <h2 className="text-xl font-black text-[#1a2b3c] tracking-tight">Security Verification</h2>
                <div className="w-10" />
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 pb-32">
                {/* Student Profile Section */}
                <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                        <div className="w-48 h-48 rounded-[48px] overflow-hidden shadow-2xl shadow-slate-200 border-[6px] border-white ring-1 ring-black/5">
                            {studentData?.photo_url ? (
                                <img src={studentData.photo_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200 font-bold text-5xl">
                                    {studentData?.full_name?.[0]}
                                </div>
                            )}
                        </div>
                        {/* Verified Badge */}
                        <div className="absolute -bottom-1 -right-1 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl p-1">
                            <div className="w-full h-full bg-[#10b981] rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </div>

                    <h1 className="text-4xl font-black text-[#1a2b3c] tracking-tight mb-2 uppercase">
                        {studentData?.full_name || 'Rahul Sharma'}
                    </h1>
                    <p className="text-xl font-black text-[#f47c20] tracking-widest uppercase mb-2">
                        ID: {studentData?.student_id || 'VP-2023-8842'}
                    </p>
                    <p className="text-base font-bold text-slate-500 tracking-tight">
                        {studentData?.departments?.name || 'Computer Science Engineering'}
                    </p>
                </div>

                {/* Status Indicator Card - Matching Mockup */}
                <div className="bg-[#f0fff4] border-2 border-[#d1fae5] rounded-[40px] p-8 text-center shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <CheckCircle2 className="w-7 h-7 text-[#10b981] fill-[#10b981]/10" />
                        <span className="text-2xl font-black text-[#065f46] tracking-tight uppercase">Valid Pass</span>
                    </div>
                    <p className="text-[13px] font-bold text-[#10b981] mb-6">
                        Verified at {verifiedAt || '10:45 AM today'}
                    </p>
                    <button className="inline-block bg-[#10b981] text-white px-10 py-3.5 rounded-2xl text-[13px] font-black tracking-[0.2em] uppercase shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
                        Green Status
                    </button>
                </div>

                {/* Details List */}
                <div className="space-y-6 pt-4">
                    {[
                        { icon: GraduationCap, label: 'Batch', value: studentData?.batch || '2021-2025' },
                        { icon: MapPin, label: 'Entry Point', value: gateName || 'Main Gate 1' },
                        { icon: Clock, label: 'Validity', value: 'Expires 06:00 PM' },
                        { icon: Home, label: 'Hostel', value: studentData?.hostel_type || 'Block B - Room 402' },
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0 group">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-[#f47c20] shadow-sm">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{item.label}</span>
                            </div>
                            <span className="text-lg font-black text-[#1a2b3c]">{item.value}</span>
                        </div>
                    ))}
                </div>

                {/* Action Controls */}
                <div className="space-y-4 pt-10">
                    <button
                        onClick={onNextScan}
                        className="w-full py-6 bg-[#f47c20] text-white font-black rounded-[32px] shadow-2xl shadow-orange-500/30 flex items-center justify-center gap-4 active:scale-[0.98] transition-all text-lg tracking-tight"
                    >
                        <Zap className="w-6 h-6 fill-white" />
                        Next Scan
                    </button>
                    <button
                        className="w-full py-6 bg-[#fff5ec] text-[#f47c20] font-black rounded-[32px] border border-[#f47c20]/10 active:scale-[0.98] transition-all text-lg tracking-tight"
                    >
                        Manual Entry
                    </button>

                    {/* Download Pass Option */}
                    <button
                        onClick={handleDownload}
                        className="w-full py-5 flex items-center justify-center gap-3 text-slate-400 font-bold text-sm hover:text-[#f47c20] transition-colors active:scale-95"
                    >
                        <Download className="w-5 h-5" />
                        Download Digital Pass
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerificationResult;
