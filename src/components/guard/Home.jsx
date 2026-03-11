import React, { useState, useEffect } from 'react';
import { Bell, TrendingUp, Clock, ShieldCheck, User, QrCode, CheckCircle2, Zap, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import VerificationResult from '../student/VerificationResult';

const GuardHome = ({ guardData }) => {
    const [stats, setStats] = useState({ totalScans: 0, activePasses: 0 });
    const [activities, setActivities] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [activeVerification, setActiveVerification] = useState(null);
    const [qrToken, setQrToken] = useState(crypto.randomUUID());
    const [qrTimeLeft, setQrTimeLeft] = useState(25);
    const [connectionStatus, setConnectionStatus] = useState('connecting'); // connecting, safe, error

    // QR Code Refresh Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setQrTimeLeft((prev) => {
                if (prev <= 1) {
                    setQrToken(crypto.randomUUID());
                    return 25;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Reusable session processing logic
    const processSessionUpdate = async (sessionId, source = 'Realtime') => {
        console.log(`[GUARD] [${source}] Processing session ${sessionId}...`);
        
        try {
            // ALWAYS fetch fresh session data
            const { data: sessionInfo, error: sessionErr } = await supabase
                .from('scan_sessions')
                .select('student_id, gate_id')
                .eq('id', sessionId)
                .single();

            if (sessionErr || !sessionInfo) {
                console.error(`[GUARD] [${source}] Failed to fetch session info:`, sessionErr);
                return;
            }

            const sessionGate = String(sessionInfo.gate_id).toLowerCase().trim();
            const guardGate = String(guardData.gate_id).toLowerCase().trim();

            if (sessionGate === guardGate && sessionInfo.student_id) {
                console.log(`[GUARD] [${source}] Gate match! Fetching student ${sessionInfo.student_id}...`);
                const { data: student } = await supabase
                    .from('students')
                    .select('*, departments(name)')
                    .eq('student_id', sessionInfo.student_id)
                    .single();

                if (student) {
                    console.log(`[GUARD] [${source}] Verification SUCCESS for:`, student.full_name);
                    setActiveVerification({
                        ...student,
                        verifiedAt: format(new Date(), 'hh:mm a')
                    });

                    // Log it in movement_logs
                    await supabase.from('movement_logs').insert({
                        user_name: student.full_name,
                        student_id: student.student_id,
                        access_point_id: guardData.gate_id,
                        movement_type: 'AUTHORIZED',
                        status: 'Success'
                    });
                }
            }
        } catch (err) {
            console.error(`[GUARD] [${source}] Error processing session:`, err);
        }
    };

    // Real-time data fetching and subscriptions
    useEffect(() => {
        if (!guardData?.gate_id) return;

        let retryTimer;
        let channel;

        const setupSubscription = () => {
            const channelName = `gate_monitor_${guardData.gate_id}`;
            console.log(`[GUARD] Initializing subscription: ${channelName}`);
            
            // Clean up old channel if it exists
            if (channel) supabase.removeChannel(channel);

            channel = supabase.channel(channelName)
                .on('postgres_changes', 
                    { event: 'INSERT', schema: 'public', table: 'movement_logs', filter: `access_point_id=eq.${guardData.gate_id}` },
                    (payload) => {
                        console.log("[GUARD] New movement log detected via Realtime");
                        setStats(prev => ({ ...prev, totalScans: prev.totalScans + 1 }));
                        setActivities(prev => [payload.new, ...prev].slice(0, 5));
                    }
                )
                .on('postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'scan_sessions', filter: "status=eq.pending" },
                    async (payload) => {
                        const { data: student } = await supabase
                            .from('students')
                            .select('*, departments(name)')
                            .eq('student_id', payload.new.student_id)
                            .single();
                        if (student) {
                            setPendingRequests(prev => [{ ...payload.new, students: student }, ...prev]);
                        }
                    }
                )
                .on('postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'scan_sessions' },
                    async (payload) => {
                        const newStatus = payload.new.status;
                        const sessionId = payload.new.id;
                        if (newStatus !== 'pending') {
                            setPendingRequests(prev => prev.filter(req => req.id !== sessionId));
                        }
                        if (newStatus === 'completed') {
                            processSessionUpdate(sessionId, 'Realtime');
                        }
                    }
                )
                .on('broadcast', { event: 'SCAN_COMPLETED' }, ({ payload }) => {
                    console.log("[GUARD] Broadcast signal received!", payload);
                    if (payload.sessionId) {
                        processSessionUpdate(payload.sessionId, 'Broadcast');
                    }
                })
                .subscribe((status, err) => {
                    console.log(`[GUARD] Real-time Status (${channelName}):`, status, err || '');
                    
                    if (status === 'SUBSCRIBED') {
                        setConnectionStatus('safe');
                        if (retryTimer) clearTimeout(retryTimer);
                    } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
                        setConnectionStatus('connecting');
                        console.warn(`[GUARD] Connection lost (${status}). Retrying in 5s...`);
                        
                        // Auto-retry logic
                        clearTimeout(retryTimer);
                        retryTimer = setTimeout(() => {
                            console.log("[GUARD] Attempting reconnection...");
                            setupSubscription();
                        }, 5000);
                    } else if (status === 'TIMED_OUT') {
                        setConnectionStatus('error');
                        setupSubscription(); // Immediate retry on timeout
                    }
                });
        };

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

                if (requests) setActivities(requests);

                // 4. Fetch initial pending requests
                const { data: pending } = await supabase
                    .from('scan_sessions')
                    .select('*, students(*, departments(name))')
                    .eq('status', 'pending');

                if (pending) setPendingRequests(pending);

            } catch (err) {
                console.error("Error fetching guard home data:", err);
            }
        };

        fetchData();
        setupSubscription();

        return () => {
            if (channel) supabase.removeChannel(channel);
            if (retryTimer) clearTimeout(retryTimer);
        };
    }, [guardData?.gate_id]);

    const handleRefresh = async () => {
        console.log("[GUARD] Manual refresh triggered...");
        
        // 1. Reset Connection (Force re-subscribe)
        setConnectionStatus('connecting');
        const channelName = `gate_monitor_${guardData.gate_id}`;
        const oldChannel = supabase.getChannels().find(c => c.name === channelName);
        if (oldChannel) supabase.removeChannel(oldChannel);
        
        // 2. Refresh basic data
        const { count: scanCount } = await supabase
            .from('movement_logs')
            .select('*', { count: 'exact', head: true })
            .eq('access_point_id', guardData.gate_id);
        
        if (scanCount !== null) setStats(prev => ({ ...prev, totalScans: scanCount }));

        const { data: requests } = await supabase
            .from('movement_logs')
            .select('*')
            .eq('access_point_id', guardData.gate_id)
            .order('created_at', { ascending: false })
            .limit(5);
        if (requests) setActivities(requests);

        // 3. Check for any missed sessions in last 1 minute
        const { data: recentSessions } = await supabase
            .from('scan_sessions')
            .select('id')
            .eq('gate_id', guardData.gate_id)
            .eq('status', 'completed')
            .gte('created_at', new Date(Date.now() - 60000).toISOString());

        if (recentSessions && recentSessions.length > 0) {
            recentSessions.forEach(session => processSessionUpdate(session.id, 'Manual Polling'));
        }
    };

    const handleApprove = async (sessionId) => {
        try {
            await supabase
                .from('scan_sessions')
                .update({
                    status: 'approved',
                    gate_id: guardData.gate_id
                })
                .eq('id', sessionId);

            setPendingRequests(prev => prev.filter(req => req.id !== sessionId));
        } catch (err) {
            console.error("Error approving request:", err);
        }
    };

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
                        <div className="flex items-center gap-2 mb-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                {guardData?.guard_gates?.name || 'GATE A-12'}
                            </p>
                            {/* Live Connection Indicator */}
                            <div className={`w-1.5 h-1.5 rounded-full ${
                                connectionStatus === 'safe' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                connectionStatus === 'connecting' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'
                            }`} title={`System Status: ${connectionStatus}`} />
                        </div>
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

            {/* Main Action Section */}
            <div className="px-6 mt-6">
                <div className="bg-white rounded-[40px] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-white relative overflow-hidden text-center">

                    <h2 className="text-3xl font-black text-[#1a2b3c] tracking-tight mb-2 uppercase">{guardData?.full_name || 'Guard'}</h2>
                    <p className="text-sm font-bold text-[#b43e8f] tracking-widest mb-8 uppercase">ID: {guardData?.employee_id || 'VP-2024-4845'}</p>

                    {/* QR Area - Very rounded peach card */}
                    <div className="w-full max-w-[260px] mx-auto relative group cursor-pointer">
                        <div className="aspect-square bg-[#fff8f6] rounded-[60px] flex items-center justify-center p-1 relative border border-[#f47c20]/5">
                            <div className="w-full h-full bg-white rounded-[40px] shadow-lg flex flex-col items-center justify-center gap-4 transition-transform group-hover:scale-105 active:scale-95 border-2 border-[#f47c20]/10 shadow-[#f47c20]/5 p-2">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=https://vishnupass.com/gate/${guardData?.gate_id}_${qrToken}`}
                                    alt="Gate QR"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>

                        {/* Progress ring/timer container */}
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 py-1.5 px-4 bg-white rounded-full shadow-md border border-gray-100 flex items-center gap-2 max-w-fit mx-auto transition-transform group-hover:scale-105">
                            <Clock className="w-3 h-3 text-[#f47c20]" />
                            <span className="text-[10px] font-black tracking-widest text-gray-600">
                                REFRESH IN <span className="text-[#f47c20]">{qrTimeLeft}S</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Requests Queue */}
            {pendingRequests.length > 0 && (
                <div className="mt-8 px-6 animate-in slide-in-from-bottom duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-[#f47c20] tracking-tight">Access Requests</h3>
                            <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">{pendingRequests.length}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {pendingRequests.map(req => (
                            <div key={req.id} className="bg-white rounded-[24px] p-3 pl-4 border-2 border-[#f47c20]/20 shadow-[0_4px_20px_rgba(244,124,32,0.1)] flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#fff8f6] shadow-sm">
                                        {req.students?.photo_url ? (
                                            <img src={req.students.photo_url} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                                                <User className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-gray-800 leading-none mb-1">{req.students?.full_name}</h4>
                                        <p className="text-[10px] font-bold text-[#f47c20] uppercase tracking-widest">{req.students?.student_id}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleApprove(req.id)}
                                    className="h-12 px-6 bg-gradient-to-r from-[#f47c20] to-[#e06b12] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#f47c20]/20 active:scale-95 transition-transform"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Activity Section */}
            <div className="mt-8 px-6 pb-20">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-black text-gray-800 tracking-tight">Recent Activity</h3>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleRefresh}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#f47c20] transition-colors"
                            title="Force Refresh Scans"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button className="text-xs font-bold text-[#f47c20]">View All</button>
                    </div>
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
