import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, LogIn, LogOut, Save, Loader2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format, isToday, isYesterday } from 'date-fns';
import VerificationResult from './VerificationResult';

const EntryLogs = ({ studentData }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, entries, exits
    const [selectedLog, setSelectedLog] = useState(null);

    const fetchLogs = useCallback(async () => {
        if (!studentData?.student_id) return;

        try {
            setLoading(true);
                const { data, error } = await supabase
                    .from('scan_sessions')
                    .select(`
                        *,
                        students!scan_sessions_student_id_fkey (
                            full_name,
                            photo_url
                        ),
                        guard_gates!scan_sessions_gate_id_fkey (
                            name
                        )
                    `)
                    .eq('student_id', studentData.student_id)
                    .order('created_at', { ascending: false })
                    .limit(50);

            console.log("[STUDENT] Fetching logs result:", { data, error });

            if (error) {
                console.error("[STUDENT] Supabase Error:", error);
                throw error;
            }
            setLogs(data || []);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    }, [studentData?.student_id]);

    useEffect(() => {
        if (!studentData?.student_id) return;
        
        fetchLogs();

        const channel = supabase
            .channel(`student_logs_${studentData.student_id}`)
            .on('postgres_changes', 
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'scan_sessions', 
                    filter: `student_id=eq.${studentData.student_id}` 
                }, 
                () => {
                    console.log("[STUDENT] Scan session logs updated via realtime");
                    fetchLogs();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [studentData?.student_id, fetchLogs]);

    // Determine if a log is entry or exit based on movement_type
    const isEntry = (log) => {
        const type = (log.movement_type || '').toLowerCase();
        return type.includes('entry') || type.includes('authorized') || type.includes('in');
    };

    // Filter logs
    const filteredLogs = logs.filter(log => {
        if (filter === 'all') return true;
        const entry = log.movement_type === 'IN' || log.movement_type === 'ENTRY';
        return filter === 'entries' ? entry : !entry;
    });

    // Group logs by date
    const groupLogsByDate = (logs) => {
        const groups = {};
        logs.forEach(log => {
            const date = new Date(log.created_at);
            let label;
            if (isToday(date)) {
                label = `TODAY, ${format(date, 'MMM d').toUpperCase()}`;
            } else if (isYesterday(date)) {
                label = `YESTERDAY, ${format(date, 'MMM d').toUpperCase()}`;
            } else {
                label = format(date, 'EEEE, MMM d').toUpperCase();
            }
            if (!groups[label]) groups[label] = [];
            groups[label].push(log);
        });
        return groups;
    };

    const grouped = groupLogsByDate(filteredLogs);
    const filterTabs = [
        { id: 'all', label: 'All' },
        { id: 'entries', label: 'Entry' },
        { id: 'exits', label: 'Exit' },
    ];

    return (
        <div className="flex-1 flex flex-col bg-[#f8f9fb] overflow-hidden">
            {/* Header */}
            <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-black text-gray-900">Entry Logs</h1>
                    </div>
                    <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors active:scale-95">
                        <Save className="w-5 h-5" />
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex bg-gray-100 rounded-xl p-1">
                    {filterTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${filter === tab.id
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Logs List */}
            <div className="flex-1 overflow-y-auto px-5 pb-28">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin text-[#f47c20] mb-3" />
                        <p className="text-sm font-bold">Loading logs...</p>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4">
                            <LogIn className="w-7 h-7 text-gray-300" />
                        </div>
                        <p className="text-sm font-bold text-gray-500">No logs found</p>
                        <p className="text-xs text-gray-400 mt-1">Your entry and exit history will appear here</p>
                    </div>
                ) : (
                    Object.entries(grouped).map(([dateLabel, dateLogs]) => (
                        <div key={dateLabel} className="mt-6">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mb-3 pl-1">
                                {dateLabel}
                            </p>
                            <div className="space-y-3">
                                {dateLogs.map(log => {
                                    const entry = isEntry(log);
                                    return (
                                        <div
                                            key={log.id}
                                            onClick={() => setSelectedLog(log)}
                                            className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-50 flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer hover:border-orange-100"
                                        >
                                            {/* Icon */}
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${entry ? 'bg-orange-50' : 'bg-gray-100'
                                                }`}>
                                                {entry ? (
                                                    <LogIn className="w-5 h-5 text-[#f47c20]" />
                                                ) : (
                                                    <LogOut className="w-5 h-5 text-gray-500" />
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">
                                                    {log.guard_gates?.name || (log.status === 'Pending' ? 'Scanning Gate...' : 'Unknown Gate')}
                                                </p>
                                                <p className="text-xs text-gray-400 font-medium mt-0.5">
                                                    {(log.movement_type === 'IN' || log.movement_type === 'ENTRY') ? 'Entry' : 'Exit'}
                                                </p>
                                            </div>

                                            {/* Status & Time */}
                                            <div className="flex flex-col items-end flex-shrink-0">
                                                <span className={`text-[10px] font-black uppercase tracking-wider ${
                                                    (log.status?.toLowerCase() === 'completed' || log.status?.toLowerCase() === 'approved') ? 'text-[#f47c20]' : 
                                                    (log.status?.toLowerCase() === 'pending') ? 'text-amber-500' :
                                                    (log.status?.toLowerCase() === 'cancelled') ? 'text-gray-400' :
                                                    'text-rose-500'
                                                    }`}>
                                                    {(log.status?.toLowerCase() === 'completed' || log.status?.toLowerCase() === 'approved') ? 'VERIFIED' : 
                                                     (log.status?.toLowerCase() === 'pending') ? 'PENDING' :
                                                     (log.status?.toLowerCase() === 'cancelled') ? 'CANCELLED' :
                                                     (log.status?.toLowerCase() === 'expired') ? 'EXPIRED' :
                                                     'DENIED'}
                                                </span>
                                                <span className="text-xs text-gray-400 font-medium mt-0.5">
                                                    {format(new Date(log.created_at), 'hh:mm a')}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Verification Overlay */}
            {selectedLog && (
                <div className="fixed inset-0 z-[100] bg-white animate-in slide-in-from-bottom duration-500 overflow-hidden">
                    <VerificationResult
                        studentData={studentData}
                        gateName={selectedLog.guard_gates?.name}
                        verifiedAt={format(new Date(selectedLog.created_at), 'hh:mm a')}
                        onNextScan={() => setSelectedLog(null)}
                        warning={selectedLog.warning}
                        status={selectedLog.status}
                    />
                </div>
            )}
        </div>
    );
};

export default EntryLogs;
