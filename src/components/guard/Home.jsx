import React, { useState, useEffect } from 'react';
import { Bell, TrendingUp, RefreshCw, Clock, ShieldCheck, ShieldAlert, User, MoreHorizontal, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

const GuardHome = ({ guardData, onScan }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [seconds, setSeconds] = useState(24);

    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds(prev => (prev > 0 ? prev - 1 : 24));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const recentActivity = [
        {
            id: 1,
            name: "Arjun Sharma",
            time: "2 mins ago",
            gate: "Gate A",
            type: "VIP Pass",
            status: "VERIFIED",
            statusColor: "bg-emerald-100 text-emerald-600",
            icon: <div className="w-10 h-10 rounded-lg bg-emerald-900/80 flex items-center justify-center text-emerald-400"><User className="w-5 h-5" /></div>
        },
        {
            id: 2,
            name: "Priya Patel",
            time: "15 mins ago",
            gate: "Gate A",
            type: "Verified",
            status: "DAY PASS",
            statusColor: "bg-blue-100 text-blue-600",
            icon: <div className="w-10 h-10 rounded-lg overflow-hidden"><img src="https://i.pravatar.cc/100?u=priya" alt="Priya" className="w-full h-full object-cover" /></div>
        },
        {
            id: 3,
            name: "Rahul Mehta",
            time: "42 mins ago",
            gate: "Gate B",
            type: "Verified",
            status: "STAFF",
            statusColor: "bg-orange-100 text-orange-600",
            icon: <div className="w-10 h-10 rounded-lg overflow-hidden"><img src="https://i.pravatar.cc/100?u=rahul" alt="Rahul" className="w-full h-full object-cover" /></div>
        },
        {
            id: 4,
            name: "Unknown Entry",
            time: "1 hr ago",
            gate: "Expired Pass detected",
            status: "DENIED",
            statusColor: "bg-rose-100 text-rose-600",
            icon: <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center text-rose-500"><AlertTriangle className="w-5 h-5" /></div>,
            isError: true
        }
    ];

    const initials = guardData?.full_name
        ? guardData.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : 'GP';

    return (
        <div className="flex flex-col min-h-screen bg-[#f8f9fb] pb-12">
            {/* Header */}
            <header className="px-6 py-4 flex justify-between items-center bg-transparent">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f4a261]/20 flex items-center justify-center border border-white/50 overflow-hidden shadow-sm">
                        {guardData?.photo_url ? (
                            <img src={guardData.photo_url} alt="Guard" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-[#e76f51]/40 flex items-center justify-center text-[#e76f51] font-bold text-sm">{initials}</div>
                        )}
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                            {guardData?.guard_gates?.name || 'GATE A-12'}
                        </p>
                        <h1 className="text-base font-black text-gray-800 leading-none">Security Officer</h1>
                    </div>
                </div>
                <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-400">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-sm shadow-rose-200"></span>
                    </div>
                </div>
            </header>

            {/* Stats Section */}
            <div className="px-6 grid grid-cols-2 gap-4 mt-2">
                <div className="bg-white p-4 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total Scans</p>
                        <div className="p-1 rounded bg-[#f47c20]/10 text-[#f47c20]">
                            <TrendingUp className="w-3 h-3" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-gray-800">1,284</p>
                    <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-2.5 h-2.5 text-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-500">+12%</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Active Passes</p>
                        <div className="p-1 rounded bg-[#f47c20]/10 text-[#f47c20]">
                            <TrendingUp className="w-3 h-3" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-gray-800">450</p>
                    <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-2.5 h-2.5 text-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-500">+5.2%</span>
                    </div>
                </div>
            </div>

            {/* Main ID Card Section */}
            <div className="px-6 mt-6">
                <div className="bg-white rounded-[40px] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-white relative overflow-hidden text-center">
                    {/* QR Area */}
                    <div className="w-full max-w-[240px] mx-auto aspect-square bg-[#fff8f5] rounded-3xl border border-[#f47c20]/5 flex items-center justify-center p-8 mb-6 relative">
                        <div className="absolute inset-4 border border-[#f47c20]/10 rounded-2xl"></div>
                        <img
                            src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=GUARD_SESSION_TOKEN_123"
                            alt="QR Session"
                            className="w-full h-full object-contain relative z-10 opacity-80"
                        />
                    </div>

                    <h2 className="text-2xl font-black text-gray-800 tracking-tight mb-1">{guardData?.full_name || 'Vishnu Vardhan'}</h2>
                    <p className="text-sm font-bold text-[#b43e8f] tracking-widest mb-8 uppercase">ID: {guardData?.employee_id || 'V21CS102'}</p>

                    {/* Timer */}
                    <div className="flex justify-center gap-3 mb-4">
                        <div className="flex flex-col items-center">
                            <div className="w-14 h-14 rounded-xl bg-blue-50/50 border border-blue-50 flex items-center justify-center text-xl font-black text-gray-800">00</div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase mt-2 tracking-widest">Hours</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-14 h-14 rounded-xl bg-blue-50/50 border border-blue-50 flex items-center justify-center text-xl font-black text-gray-800">00</div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase mt-2 tracking-widest">Mins</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-14 h-14 rounded-xl bg-[#fff5ef] border border-[#f47c20]/10 flex items-center justify-center text-xl font-black text-[#f47c20]">{seconds.toString().padStart(2, '0')}</div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase mt-2 tracking-widest">Secs</span>
                        </div>
                    </div>

                    <p className="text-center text-[11px] font-bold text-gray-400 mb-6 flex items-center justify-center gap-1.5">
                        Refreshes in <span className="text-[#f47c20] font-black">{seconds}s</span>
                    </p>

                    <button className="w-full py-4 bg-gradient-to-r from-[#f47c20] to-[#e06b12] text-white font-black rounded-2xl shadow-xl shadow-[#f47c20]/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
                        <RefreshCw className="w-5 h-5" />
                        Refresh QR Code
                    </button>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="mt-8 px-6 pb-20">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-black text-gray-800 tracking-tight">Recent Activity</h3>
                    <button className="text-xs font-bold text-[#f47c20]">View All</button>
                </div>

                <div className="space-y-4">
                    {recentActivity.map((activity) => (
                        <div key={activity.id} className={`bg-white rounded-[28px] p-4 border border-white shadow-sm flex items-center justify-between group`}>
                            <div className="flex items-center gap-4">
                                {activity.icon}
                                <div>
                                    <h4 className="text-sm font-black text-gray-800 leading-none mb-1.5">{activity.name}</h4>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">
                                        <Clock className="w-3 h-3 inline mr-1 -mt-0.5" />
                                        {activity.time} • <span className={activity.isError ? "text-rose-500" : ""}>{activity.gate}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                                <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg tracking-wider uppercase ${activity.statusColor}`}>
                                    {activity.status}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 tracking-tighter">
                                    {activity.type}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GuardHome;
