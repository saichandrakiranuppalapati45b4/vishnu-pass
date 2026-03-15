import React, { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle2, ShieldCheck, Zap, Download, Scan, UserCircle, History, LayoutDashboard, User, AlertTriangle, X, Octagon } from 'lucide-react';
import { format } from 'date-fns';

const VerificationResult = ({ studentData, gateName, verifiedAt, onNextScan, warning, hideNavBar = false }) => {
    const [isAcknowledged, setIsAcknowledged] = useState(false);

    useEffect(() => {
        if (warning && !isAcknowledged) {
            // Play warning sound
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.volume = 0.6;
            audio.play().catch(e => console.warn("Audio play blocked:", e));
        }
    }, [warning, isAcknowledged]);

    // If there's a warning and it hasn't been acknowledged, show the Dedicated Warning Page
    if (warning && !isAcknowledged) {
        return (
            <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#f47c20] to-[#e76f51] font-sans h-screen overflow-hidden">
                {/* Background Graphics */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
                    <Octagon className="w-[800px] h-[800px] absolute -top-40 -left-40 animate-pulse text-white" />
                    <Octagon className="w-[600px] h-[600px] absolute -bottom-20 -right-20 animate-pulse text-white" />
                </div>

                <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center animate-in zoom-in duration-500">
                    {/* Pulsing Icon Container */}
                    <div className="relative mb-10 mt-10">
                        <div className="absolute inset-0 bg-white/20 rounded-[40px] animate-ping scale-110" />
                        <div className="w-40 h-40 bg-white/20 backdrop-blur-3xl rounded-[40px] flex items-center justify-center border-4 border-white/40 shadow-2xl relative z-20">
                            <AlertTriangle className="w-20 h-20 text-white animate-bounce" />
                        </div>
                    </div>

                    <h1 className="text-4xl font-black text-white tracking-tight uppercase mb-4 drop-shadow-md">
                        Limit Reached
                    </h1>
                    
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] p-8 mb-10 w-full shadow-2xl">
                        <p className="text-white text-lg font-black leading-tight mb-3">
                            {warning}
                        </p>
                        <div className="h-px bg-white/20 w-16 mx-auto mb-4" />
                        <p className="text-white/80 text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed">
                            Your monthly scan quota has been exceeded. Please be informed that your activities are being specifically monitored.
                        </p>
                    </div>

                    <div className="space-y-4 w-full">
                        <button
                            onClick={() => setIsAcknowledged(true)}
                            className="w-full py-6 bg-white text-[#f47c20] rounded-[24px] font-black text-sm tracking-[0.2em] uppercase shadow-[0_10px_40px_rgba(0,0,0,0.1)] active:scale-[0.98] transition-all hover:shadow-none"
                        >
                            I Understand & Continue
                        </button>
                        
                        <p className="text-white/60 text-[9px] font-bold uppercase tracking-widest text-center mt-4">
                            Authorized access verified for {studentData?.full_name || 'Student'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-[#f8f9fb] animate-in slide-in-from-bottom duration-500 overflow-y-auto font-sans h-screen pb-32 relative">
            {/* Header */}
            <div className="px-6 py-8 flex items-center bg-white justify-between sticky top-0 z-50">
                <button
                    onClick={onNextScan}
                    className="w-10 h-10 flex items-center justify-center text-[#1a2b3c] active:scale-90 transition-transform"
                >
                    <ChevronLeft className="w-8 h-8" />
                </button>
                <h2 className="text-xl font-bold text-[#1a2b3c] tracking-tight">Verification Result</h2>
                <div className="w-10 h-10 rounded-xl bg-[#fff5ec] flex items-center justify-center text-[#f47c20]">
                    <LayoutDashboard className="w-5 h-5" />
                </div>
            </div>

            <div className="px-6 py-6 space-y-6">
                {/* Profile Section */}
                <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                        {/* Status Label Popup */}
                        <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border-2 shadow-lg z-20 backdrop-blur-md ${
                            String(studentData?.hostel_type).toLowerCase().includes('dayscholar') 
                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 shadow-blue-500/10' 
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-600 shadow-rose-500/10'
                        }`}>
                            {String(studentData?.hostel_type).toLowerCase().includes('dayscholar') ? 'Dayscholar' : 'Hosteller'}
                        </div>

                        <div className={`w-44 h-44 rounded-full overflow-hidden border-4 bg-white relative z-10 shadow-2xl transition-all duration-500 ${
                            String(studentData?.hostel_type).toLowerCase().includes('dayscholar') 
                            ? 'border-blue-100 shadow-blue-500/20 ring-4 ring-blue-500/10' 
                            : 'border-rose-100 shadow-rose-500/20 ring-4 ring-rose-500/10'
                        }`}>
                            {studentData?.photo_url ? (
                                <img src={studentData.photo_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                    <UserCircle className="w-24 h-24" />
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-2 right-2 w-10 h-10 bg-[#a6cc39] rounded-full flex items-center justify-center border-4 border-white shadow-lg z-20">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-black text-[#1a2b3c] tracking-tight">{studentData?.full_name || 'Rahul Sharma'}</h1>
                    <p className="text-slate-400 font-bold tracking-wide mt-1">Student ID: {studentData?.student_id || 'VP-2023-8842'}</p>
                </div>

                {/* Status Card */}
                <div className={`${warning ? 'bg-amber-50 border-amber-200' : 'bg-[#f0f4e8] border-[#e0e7d0]'} rounded-[32px] p-6 flex items-center justify-between shadow-sm`}>
                    <div>
                        <h3 className={`${warning ? 'text-amber-600' : 'text-[#a6cc39]'} text-xl font-black tracking-tight uppercase`}>{warning ? 'Limit Warning' : 'Valid Pass'}</h3>
                        <p className="text-slate-500 text-xs font-bold">{warning ? warning : 'Access Authorized for Entry'}</p>
                    </div>
                    <div className={`flex items-center gap-2 ${warning ? 'bg-amber-500 shadow-amber-500/20' : 'bg-[#a6cc39] shadow-[#a6cc39]/20'} text-white px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase shadow-lg`}>
                        {warning ? <Zap className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        {warning ? 'Alert' : 'Green'}
                    </div>
                </div>

                {/* Student Information */}
                <div>
                    <h4 className="text-[11px] font-black text-[#f47c20] uppercase tracking-[0.2em] mb-4 px-2">Student Information</h4>
                    <div className="bg-white rounded-[40px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-50 space-y-6">
                        {[
                            { label: 'Department', value: studentData?.departments?.name || 'Computer Science Engineering', color: 'text-[#1a2b3c]' },
                            { label: 'Year', value: `${studentData?.year_of_study || '3rd Year'} (Batch ${studentData?.batch || '2021-2025'})`, color: 'text-[#1a2b3c]' },
                            { label: 'Hostel/Room', value: studentData?.hostel_type || 'Block B - Room 402', color: 'text-[#1a2b3c]' },
                            { label: 'Blood Group', value: studentData?.blood_group || 'O+', color: 'text-rose-500' },
                            { label: 'Emergency Contact', value: studentData?.emergency_contact || '+91 98765 43210', color: 'text-[#f47c20]' },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <span className="text-[13px] font-medium text-slate-400">{item.label}</span>
                                <span className={`text-[13px] font-bold ${item.color} text-right ml-4`}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Verification Details */}
                <div>
                    <h4 className="text-[11px] font-black text-[#f47c20] uppercase tracking-[0.2em] mb-4 px-2">Verification Details</h4>
                    <div className="bg-white rounded-[40px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-50 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#f8f9fb] p-4 rounded-2xl">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Entry Point</p>
                                <p className="text-[11px] font-black text-[#1a2b3c]">{gateName || 'Main Gate 1'}</p>
                            </div>
                            <div className="bg-[#f8f9fb] p-4 rounded-2xl">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Scanned At</p>
                                <p className="text-[11px] font-black text-[#1a2b3c]">{verifiedAt || format(new Date(), 'hh:mm a')}, Today</p>
                            </div>
                            <div className="col-span-2 bg-[#f8f9fb] p-4 rounded-2xl">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Valid Until</p>
                                <p className="text-[11px] font-black text-[#1a2b3c]">05:00 PM, {format(new Date(), 'dd MMM yyyy')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationResult;
