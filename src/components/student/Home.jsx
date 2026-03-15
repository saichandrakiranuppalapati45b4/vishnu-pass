import React, { useState, useEffect } from 'react';
import { Bell, User, ArrowRight, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { useLanguage } from '../../contexts/LanguageContext';

const Home = ({ studentData, onNotificationClick }) => {
    const [logs, setLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const { t } = useLanguage();

    useEffect(() => {
        const fetchUnreadCount = async () => {
            const { count } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('recipient_id', studentData.id)
                .eq('is_read', false);
            setUnreadCount(count || 0);
        };

        const fetchLogs = async () => {
            try {
                const { data, error } = await supabase
                    .from('scan_sessions')
                    .select(`
                        *,
                        students!scan_sessions_student_id_fkey(full_name, photo_url),
                        guard_gates!scan_sessions_gate_id_fkey(name)
                    `)
                    .eq('student_id', studentData.student_id)
                    .order('created_at', { ascending: false })
                    .limit(4);
                
                if (error) {
                    console.error("[STUDENT] Fetch logs error:", error);
                    throw error;
                }
                setLogs(data || []);
            } catch (error) {
                console.error('Error fetching logs:', error);
            } finally {
                setLoadingLogs(false);
            }
        };

        if (studentData?.student_id) {
            fetchLogs();
            fetchUnreadCount();
        }

        // Subscribe to scan_sessions changes
        const channel = supabase
            .channel(`student_home_${studentData.student_id}`)
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'scan_sessions', filter: `student_id=eq.${studentData.student_id}` },
                () => {
                    console.log("[STUDENT] Home logs updated via realtime from scan_sessions");
                    fetchLogs();
                }
            )
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${studentData.id}` },
                () => fetchUnreadCount()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [studentData]);

    const initials = studentData?.full_name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase() || 'ST';

    return (
        <div className="flex-1 bg-[#f8f9fb] pb-24 overflow-y-auto font-sans">
            {/* Header */}
            <header className="flex justify-between items-center p-6 bg-white shadow-sm border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
                        <img src="/vishnu-logo.png" alt="Vishnu Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-xl font-black text-gray-900 tracking-tight">Vishnu Pass</h1>
                </div>

                <button 
                    onClick={onNotificationClick}
                    className="relative p-1 text-gray-400 hover:text-[#f47c20] transition-colors"
                >
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 bg-orange-500 text-white text-[8px] font-black rounded-full border-2 border-white flex items-center justify-center animate-in zoom-in duration-300">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            </header>

            {/* Main Content */}
            <div className="p-6 space-y-8">

                {/* Profile Dossier Card */}
                <div className="bg-white rounded-[40px] border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.03)] p-8 relative overflow-hidden">
                    {/* Background accent */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-orange-50/50 rounded-full blur-3xl -translate-y-24 translate-x-24" />

                    <div className="relative z-10">
                        {/* Profile Info Row */}
                        <div className="flex items-center gap-6 mb-10">
                            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-lg bg-orange-50 flex-shrink-0">
                                {studentData?.photo_url ? (
                                    <img src={studentData.photo_url} alt="Student" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full rounded-full flex items-center justify-center text-[#f47c20] text-2xl font-black">
                                        {initials}
                                    </div>
                                )}
                            </div>
                            <div>
                                <span className="inline-block px-3 py-1 bg-orange-50 text-[#f47c20] text-[10px] font-black uppercase tracking-widest rounded-full mb-2">
                                    {studentData?.year_of_study || '3rd'} Year Student
                                </span>
                                <h2 className="text-2xl font-black text-gray-900 leading-tight">{studentData?.full_name || 'Vishnu Vardhan'}</h2>
                                <p className="text-gray-400 font-bold text-sm tracking-wide">ID: {studentData?.student_id || 'V21CS102'}</p>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-y-8">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Department</p>
                                <p className="text-sm font-black text-gray-900">{studentData?.departments?.name || 'Computer Science'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Blood Group</p>
                                <p className="text-sm font-black text-gray-900">{studentData?.blood_group || 'O+ Positive'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Validity</p>
                                <p className="text-sm font-black text-emerald-500">Until {studentData?.valid_until ? format(new Date(studentData.valid_until), 'MMMM yyyy') : 'June 2025'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Campus</p>
                                <p className="text-sm font-black text-gray-900">{studentData?.campus || 'Main Campus'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Entry Logs */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                            {t('home.latestActivity')}
                        </h3>
                        <button className="text-sm font-bold text-[#f47c20] hover:underline">View All</button>
                    </div>

                    <div className="space-y-4">
                        {loadingLogs ? (
                            <p className="text-center py-8 text-gray-400 font-bold text-sm">Loading activity logs...</p>
                        ) : logs.length === 0 ? (
                            <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-sm">
                                <p className="text-gray-400 font-bold text-sm">No activity logs recorded yet.</p>
                            </div>
                        ) : (
                            logs.map((log) => (
                                <div key={log.id} className="bg-white rounded-[32px] p-5 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${(log.movement_type === 'IN' || log.movement_type === 'ENTRY') ? 'bg-emerald-50 text-emerald-500' : 'bg-orange-50 text-orange-500'}`}>
                                            {(log.movement_type === 'IN' || log.movement_type === 'ENTRY') ? <LogIn className="w-6 h-6" /> : <LogOut className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900">
                                                {log.guard_gates?.name || (log.status === 'Pending' ? 'Scanning Gate...' : 'Gate')} - {(log.movement_type === 'IN' || log.movement_type === 'ENTRY') ? t('home.entry') : t('home.exit')}
                                            </h4>
                                            <p className="text-xs font-bold text-gray-400 tracking-wide">
                                                {format(new Date(log.created_at), 'MMM dd, yyyy')} • {format(new Date(log.created_at), 'hh:mm a')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`px-3 py-1 ${
                                            (log.status === 'Success' || log.status === 'completed' || log.status === 'approved') ? 'bg-emerald-50 text-emerald-500' : 
                                            (log.status === 'Pending' || log.status === 'pending') ? 'bg-amber-50 text-amber-500' :
                                            'bg-gray-50 text-gray-400'
                                            } text-[10px] font-black tracking-widest rounded-lg flex items-center gap-1`}>
                                            {(log.status === 'Success' || log.status === 'completed' || log.status === 'approved') ? <CheckCircle2 className="w-3 h-3" /> : null}
                                            {(log.status === 'Success' || log.status === 'completed' || log.status === 'approved') ? 'VERIFIED' : 
                                             (log.status === 'Pending' || log.status === 'pending') ? 'PENDING' :
                                             (log.status === 'Cancelled' || log.status === 'cancelled') ? 'CANCELLED' :
                                             log.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;
