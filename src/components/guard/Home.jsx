import React, { useState, useEffect } from 'react';
import { Bell, TrendingUp, RefreshCw, Clock, ShieldCheck, ShieldAlert, User, MoreHorizontal, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import VerificationResult from '../student/VerificationResult';

const GuardHome = ({ guardData }) => {
    const [stats, setStats] = useState({ totalScans: 0, activePasses: 0 });
    const [activities, setActivities] = useState([]);
    const [qrToken, setQrToken] = useState(crypto.randomUUID());
    const [seconds, setSeconds] = useState(30);
    const [activeVerification, setActiveVerification] = useState(null);

    // QR Code timer and rotation
    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds(prev => {
                if (prev <= 1) {
                    setQrToken(crypto.randomUUID());
                    return 30;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Real-time data fetching and subscriptions
    useEffect(() => {
        if (!guardData?.gate_id) return;

        const fetchData = async () => {
            try {
                // 1. Fetch Total Scans from movement_logs for this gate
                const { count: scanCount } = await supabase
                    .from('movement_logs')
                    .select('*', { count: 'exact', head: true })
                    .eq('access_point_id', guardData.gate_id);

                // 2. Fetch Active Pass holders
                const { count: studentCount } = await supabase
                    .from('students')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'Active');

                setStats({
                    totalScans: scanCount || 0,
                    activePasses: studentCount || 0
                });

                // 3. Fetch Recent Activity from movement_logs
                const { data: requests } = await supabase
                    .from('movement_logs')
                    .select('*')
                    .eq('access_point_id', guardData.gate_id)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (requests) {
                    setActivities(requests);
                }

            } catch (err) {
                console.error("Error fetching guard home data:", err);
            }
        };

        fetchData();

        // Real-time subscription for movement_logs
        const channel = supabase
            .channel('guard_home_updates')
            .on('postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'movement_logs',
                    filter: `access_point_id=eq.${guardData.gate_id}`
                },
                async (payload) => {
                    // Update stats instantly
                    setStats(prev => ({ ...prev, totalScans: prev.totalScans + 1 }));

                    // Trigger Verification View if it's a valid student
                    if (payload.new.student_id) {
                        const { data: student } = await supabase
                            .from('students')
                            .select('*, departments(name)')
                            .eq('student_id', payload.new.student_id)
                            .single();

                        if (student) {
                            setActiveVerification({
                                ...student,
                                verifiedAt: format(new Date(), 'hh:mm a')
                            });

                            // Add to activity list
                            setActivities(prev => [payload.new, ...prev].slice(0, 5));
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [guardData?.gate_id]);

    const initials = guardData?.full_name
        ? guardData.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : 'GP';

    return (
        <div className="flex flex-col min-h-screen bg-[#f8f9fb] pb-12">
            {/* Verification Overlay */}
            {activeVerification && (
                <div className="fixed inset-0 z-[100] bg-white animate-in slide-in-from-bottom duration-500">
                    <VerificationResult
                        studentData={activeVerification}
                        gateName={guardData?.guard_gates?.name}
                        verifiedAt={activeVerification.verifiedAt}
                        onNextScan={() => setActiveVerification(null)}
                    />
                </div>
            )}

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
                    <p className="text-2xl font-black text-gray-800">{stats.totalScans.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="w-2.5 h-2.5 text-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-500">Live</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Active Passes</p>
                        <div className="p-1 rounded bg-[#f47c20]/10 text-[#f47c20]">
                            <TrendingUp className="w-3 h-3" />
                        </div>
                    </div>
                    <p className="text-2xl font-black text-gray-800">{stats.activePasses.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-1">
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-500">Active Students</span>
                    </div>
                </div>
            </div>

            {/* Main ID Card Section */}
            <div className="px-6 mt-6">
                <div className="bg-white rounded-[40px] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-white relative overflow-hidden text-center">
                    {/* QR Area - Very rounded peach card */}
                    <div className="w-full max-w-[260px] mx-auto aspect-square bg-[#fff8f6] rounded-[60px] flex items-center justify-center p-12 mb-8 relative border border-[#f47c20]/5">
                        <div className="w-full h-full bg-white rounded-[40px] p-4 shadow-sm flex items-center justify-center">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=https://vishnupass.com/scan/${guardData?.gate_id}_${qrToken}`}
                                alt="QR Session"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-[#1a2b3c] tracking-tight mb-2 uppercase">{guardData?.full_name || 'Guard'}</h2>
                    <p className="text-sm font-bold text-[#b43e8f] tracking-widest mb-10 uppercase">ID: {guardData?.employee_id || 'VP-2024-4845'}</p>

                    {/* Timer - Stylized Boxes */}
                    <div className="flex justify-center gap-4 mb-6">
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-20 rounded-2xl bg-[#f0f9ff]/50 border border-[#e0f2fe] flex items-center justify-center text-2xl font-black text-[#1a2b3c]">00</div>
                            <span className="text-[10px] font-black text-gray-400 uppercase mt-3 tracking-widest">Hours</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-20 rounded-2xl bg-[#f0f9ff]/50 border border-[#e0f2fe] flex items-center justify-center text-2xl font-black text-[#1a2b3c]">00</div>
                            <span className="text-[10px] font-black text-gray-400 uppercase mt-3 tracking-widest">Mins</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-20 rounded-2xl bg-[#fff8f6] border border-[#f47c20]/10 flex items-center justify-center text-2xl font-black text-[#f47c20]">
                                {seconds.toString().padStart(2, '0')}
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase mt-3 tracking-widest">Secs</span>
                        </div>
                    </div>

                    <p className="text-center text-[12px] font-bold text-gray-400 mb-8 tracking-tight">
                        Refreshes in <span className="text-[#f47c20] font-black">{seconds}s</span>
                    </p>

                    <button
                        onClick={() => {
                            setQrToken(crypto.randomUUID());
                            setSeconds(30);
                        }}
                        className="w-full py-4 bg-gradient-to-r from-[#f47c20] to-[#e06b12] text-white font-black rounded-2xl shadow-xl shadow-[#f47c20]/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all text-xs tracking-[0.2em] uppercase"
                    >
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
                    {activities.length === 0 ? (
                        <div className="py-8 text-center text-gray-400 font-bold text-xs uppercase tracking-widest bg-white rounded-[28px] border border-dashed border-gray-200">
                            No recent scans at this gate
                        </div>
                    ) : (
                        activities.map((activity) => (
                            <div key={activity.id} className={`bg-white rounded-[28px] p-4 border border-white shadow-sm flex items-center justify-between group`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activity.status === 'Success' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-gray-800 leading-none mb-1.5">{activity.user_name}</h4>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">
                                            <Clock className="w-3 h-3 inline mr-1 -mt-0.5" />
                                            {format(new Date(activity.created_at), 'hh:mm a')} • {activity.student_id || 'GUEST'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                    <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg tracking-wider uppercase ${activity.status === 'Success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                        {activity.status}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 tracking-tighter uppercase">
                                        {activity.movement_type}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default GuardHome;
