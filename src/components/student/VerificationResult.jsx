import React from 'react';
import { ChevronLeft, CheckCircle2, ShieldCheck, Zap, Download, Scan, UserCircle, History, LayoutDashboard, User } from 'lucide-react';
import { format } from 'date-fns';

const VerificationResult = ({ studentData, gateName, verifiedAt, onNextScan }) => {

    return (
        <div className="flex flex-col bg-[#f8f9fb] animate-in slide-in-from-bottom duration-500 overflow-y-auto font-sans h-screen pb-32">
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
                        <div className="w-44 h-44 rounded-full overflow-hidden shadow-2xl shadow-slate-200 border-4 border-white">
                            {studentData?.photo_url ? (
                                <img src={studentData.photo_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                    <UserCircle className="w-24 h-24" />
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-2 right-2 w-10 h-10 bg-[#a6cc39] rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-black text-[#1a2b3c] tracking-tight">{studentData?.full_name || 'Rahul Sharma'}</h1>
                    <p className="text-slate-400 font-bold tracking-wide mt-1">Student ID: {studentData?.student_id || 'VP-2023-8842'}</p>
                </div>

                {/* Status Card */}
                <div className="bg-[#f0f4e8] border border-[#e0e7d0] rounded-[32px] p-6 flex items-center justify-between shadow-sm">
                    <div>
                        <h3 className="text-[#a6cc39] text-xl font-black tracking-tight uppercase">Valid Pass</h3>
                        <p className="text-slate-500 text-xs font-bold">Access Authorized for Entry</p>
                    </div>
                    <div className="flex items-center gap-2 bg-[#a6cc39] text-white px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase shadow-lg shadow-[#a6cc39]/20">
                        <CheckCircle2 className="w-4 h-4" />
                        Green
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
                                <p className="text-[11px] font-black text-[#1a2b3c]">06:00 PM, 24 Oct 2023</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-4 pt-4">
                    <button
                        onClick={onNextScan}
                        className="w-full py-5 bg-[#f47c20] text-white font-black rounded-2xl shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all text-[15px] tracking-tight"
                    >
                        <Scan className="w-5 h-5" />
                        Next Scan
                    </button>
                    <button
                        className="w-full py-5 bg-[#e9eff5] text-[#1a2b3c] font-black rounded-2xl active:scale-[0.98] transition-all text-[15px] tracking-tight flex items-center justify-center gap-3"
                    >
                        <History className="w-5 h-5" />
                        Manual Entry
                    </button>
                </div>
            </div>

            {/* Bottom Nav Simulation (Optional, depends on if it's rendered within dashboard) */}
            <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around px-6 z-50">
                <div className="flex flex-col items-center gap-1 text-[#f47c20]">
                    <LayoutDashboard className="w-5 h-5 fill-current" />
                    <span className="text-[9px] font-black uppercase">Home</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-slate-300">
                    <History className="w-5 h-5" />
                    <span className="text-[9px] font-black uppercase">History</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-slate-300">
                    <UserCircle className="w-5 h-5" />
                    <span className="text-[9px] font-black uppercase">Roster</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-slate-300">
                    <User className="w-5 h-5" />
                    <span className="text-[9px] font-black uppercase">Profile</span>
                </div>
            </div>
        </div>
    );
};

export default VerificationResult;
