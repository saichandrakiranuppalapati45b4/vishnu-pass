import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Clock, User, ShieldCheck, ShieldAlert, MoreHorizontal, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

const GuardHistory = ({ guardData }) => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('ALL'); // ALL, AUTHORIZED, DENIED

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            try {
                let query = supabase
                    .from('movement_logs')
                    .select('*')
                    .order('created_at', { ascending: false });

                // If we want to filter by gate_id (optional, depends on if guard should see only their gate)
                // if (guardData?.gate_id) {
                //     query = query.eq('access_point_id', guardData.gate_id);
                // }

                const { data, error } = await query;

                if (error) throw error;
                setLogs(data || []);
            } catch (err) {
                console.error("Error fetching logs:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();

        // Optional: Set up real-time subscription
        const subscription = supabase
            .channel('movement_logs_changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'movement_logs' }, (payload) => {
                setLogs(prev => [payload.new, ...prev]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [guardData?.gate_id]);

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.student_id?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'ALL' || log.movement_type === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex flex-col min-h-screen bg-[#f8f9fb]">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-[#f8f9fb]/80 backdrop-blur-md z-30 px-6 pt-12 pb-6">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-6">Activity History</h2>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or student ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#f47c20]/20 focus:border-[#f47c20] text-sm font-medium shadow-sm transition-all"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                    {['ALL', 'AUTHORIZED', 'MANUAL OVERRIDE'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f
                                    ? 'bg-[#f47c20] text-white shadow-lg shadow-[#f47c20]/20'
                                    : 'bg-white text-gray-400 border border-gray-100'
                                }`}
                        >
                            {f === 'MANUAL OVERRIDE' ? 'Manual' : f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Logs List */}
            <div className="px-6 pb-24">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-[#f47c20]" />
                        <p className="text-sm font-bold uppercase tracking-widest">Loading Logs...</p>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                            <Filter className="w-8 h-8 opacity-20" />
                        </div>
                        <div>
                            <p className="text-sm font-bold uppercase tracking-widest">No matching logs</p>
                            <p className="text-xs font-medium mt-1">Try adjusting your filters or search query</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredLogs.map((log) => (
                            <div key={log.id} className="bg-white rounded-[28px] p-4 border border-white shadow-sm flex items-center justify-between group animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${log.status === 'Success' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
                                        }`}>
                                        {log.status === 'Success' ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-gray-800 leading-none mb-1.5">{log.user_name}</h4>
                                        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">
                                                <Clock className="w-3 h-3 inline mr-1 -mt-0.5" />
                                                {format(new Date(log.created_at), 'hh:mm a')} • {log.student_id || 'GUEST'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                    <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg tracking-wider uppercase ${log.movement_type === 'AUTHORIZED' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
                                        }`}>
                                        {log.movement_type === 'AUTHORIZED' ? 'SCAN' : 'MANUAL'}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 tracking-tighter">
                                        {format(new Date(log.created_at), 'MMM dd, yyyy')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GuardHistory;
