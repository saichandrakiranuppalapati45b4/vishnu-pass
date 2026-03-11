import React, { useState, useEffect } from 'react';
import {
    Search, Bell, Download, Filter, ChevronLeft, ChevronRight,
    RotateCcw, Calendar, User, Zap,
    AlertTriangle, FileText, Loader2, ArrowLeft
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

const ActionBadge = ({ action }) => {
    let colors = 'bg-gray-100 text-gray-600';
    if (action.includes('Registered')) colors = 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    if (action.includes('Config')) colors = 'bg-amber-50 text-amber-600 border border-amber-100';
    if (action.includes('Export')) colors = 'bg-blue-50 text-blue-600 border border-blue-100';
    if (action.includes('Revoked')) colors = 'bg-rose-50 text-rose-600 border border-rose-100';
    if (action.includes('Upload')) colors = 'bg-indigo-50 text-indigo-600 border border-indigo-100';
    if (action.includes('Activated')) colors = 'bg-teal-50 text-teal-600 border border-teal-100';
    if (action.includes('Deactivated')) colors = 'bg-orange-50 text-orange-600 border border-orange-100';
    if (action.includes('Role')) colors = 'bg-purple-50 text-purple-600 border border-purple-100';

    return (
        <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${colors}`}>
            {action}
        </span>
    );
};

const AuditLogs = ({ onBack }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        globalTotal: 0,
        total: 0,
        registrations: 0,
        changes: 0
    });

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            // Fetch the last 100 logs
            const { data, error } = await supabase
                .from('audit_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;
            setLogs(data);

            // Fetch Real-time Statistics
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

            // 0. Total Lifetime Logs for Pagination
            const { count: globalTotalLogs, error: globalCountErr } = await supabase
                .from('audit_logs')
                .select('*', { count: 'exact', head: true });
            if (globalCountErr) console.error("Error fetching global count:", globalCountErr);

            // 1. Total Logs in last 24h
            const { count: totalLogs, error: countErr1 } = await supabase
                .from('audit_logs')
                .select('*', { count: 'exact', head: true })
                .gt('created_at', yesterday);
            if (countErr1) console.error("Error fetching totalLogs:", countErr1);

            // 2. New Registrations (Any action containing 'Registered')
            const { count: regCount, error: countErr2 } = await supabase
                .from('audit_logs')
                .select('*', { count: 'exact', head: true })
                .ilike('action', '%Registered%');
            if (countErr2) console.error("Error fetching regCount:", countErr2);

            // 3. Config Changes (Any action containing 'Config' or 'Role')
            const { count: configCount, error: countErr3 } = await supabase
                .from('audit_logs')
                .select('*', { count: 'exact', head: true })
                .or('action.ilike.%Config%,action.ilike.%Role%');
            if (countErr3) console.error("Error fetching configCount:", countErr3);

            setStats({
                globalTotal: globalTotalLogs || 0,
                total: totalLogs || 0,
                registrations: regCount || 0,
                changes: configCount || 0
            });
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#f8f9fb]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-[#f47c20] animate-spin" />
                    <p className="text-sm font-black text-gray-500 uppercase tracking-widest italic">Retrieving audit trails...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-[#f8f9fb]">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-all text-gray-400 hover:text-gray-600 shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div className="w-10 h-10 bg-[#fff4eb] rounded-xl flex items-center justify-center">
                        <RotateCcw className="w-5 h-5 text-[#f47c20]" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight italic">System Audit Logs</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-gray-600 shadow-sm transition-all">
                        <Bell className="w-5 h-5" />
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-[#f47c20] text-white font-black rounded-xl text-xs shadow-lg shadow-orange-500/20 hover:bg-[#e06d1c] transition-all active:scale-95">
                        <Download className="w-4 h-4" />
                        EXPORT
                    </button>
                </div>
            </div>

            {/* Filter Card */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 mb-8">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by Admin, Action, or Resource ID..."
                            className="w-full pl-11 pr-4 py-3 bg-[#f8fafc] border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#f47c20]/10 transition-all placeholder:text-gray-400"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-3 bg-[#f8fafc] border border-gray-100 rounded-2xl text-[11px] font-black text-gray-600 uppercase tracking-wider hover:bg-gray-50 transition-all">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            Date Range
                            <ChevronRight className="w-3 h-3 rotate-90" />
                        </button>
                        <button className="flex items-center gap-2 px-4 py-3 bg-[#f8fafc] border border-gray-100 rounded-2xl text-[11px] font-black text-gray-600 uppercase tracking-wider hover:bg-gray-50 transition-all">
                            <User className="w-4 h-4 text-gray-400" />
                            Admin User
                            <ChevronRight className="w-3 h-3 rotate-90" />
                        </button>
                        <button className="flex items-center gap-2 px-4 py-3 bg-[#f8fafc] border border-gray-100 rounded-2xl text-[11px] font-black text-gray-600 uppercase tracking-wider hover:bg-gray-50 transition-all">
                            <Filter className="w-4 h-4 text-gray-400" />
                            Action Type
                            <ChevronRight className="w-3 h-3 rotate-90" />
                        </button>
                        <button
                            onClick={() => fetchLogs()}
                            className="p-3 bg-orange-50 text-[#f47c20] rounded-2xl hover:bg-orange-100 transition-all active:rotate-180 duration-500"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="mt-8 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50">
                                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] px-4">Timestamp</th>
                                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] px-4">Admin User</th>
                                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] px-4">Action</th>
                                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] px-4">Resource</th>
                                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] px-4">IP Address</th>
                                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] px-4 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {logs.map((log) => (
                                <tr key={log.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="py-5 px-4">
                                        <p className="text-[13px] font-bold text-gray-500">
                                            {format(new Date(log.created_at), 'MMM dd, yyyy')} <span className="text-gray-300 mx-1">•</span> {format(new Date(log.created_at), 'HH:mm:ss')}
                                        </p>
                                    </td>
                                    <td className="py-5 px-4 text-[13px] font-black text-gray-900">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 text-[#f47c20] flex items-center justify-center text-[10px] font-black">
                                                {log.admin_name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            {log.admin_name}
                                        </div>
                                    </td>
                                    <td className="py-5 px-4">
                                        <ActionBadge action={log.action} />
                                    </td>
                                    <td className="py-5 px-4 text-[13px] font-bold text-gray-500">
                                        {log.resource}
                                    </td>
                                    <td className="py-5 px-4 text-[13px] font-bold text-gray-400 font-mono">
                                        {log.ip_address}
                                    </td>
                                    <td className="py-5 px-4 text-right">
                                        <button className="text-[11px] font-black text-[#f47c20] hover:underline uppercase tracking-wider">
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-2">
                                                <FileText className="w-8 h-8 text-gray-200" />
                                            </div>
                                            <h4 className="text-lg font-black text-gray-900 italic">No Audit Trails Captured</h4>
                                            <p className="text-sm text-gray-400 font-medium max-w-sm mx-auto">
                                                Historical dummy data has been cleared. The system is now monitoring for live administrative activity.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-400 italic">
                        Showing {logs.length > 0 ? 1 : 0} to {logs.length} of {stats.globalTotal} entries
                    </p>
                    <div className="flex items-center gap-2">
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 text-gray-400 transition-all hover:bg-gray-50">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#f47c20] text-white font-black text-sm shadow-md shadow-orange-500/20">
                            1
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 text-gray-600 font-bold text-sm transition-all hover:bg-gray-50">
                            2
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 text-gray-600 font-bold text-sm transition-all hover:bg-gray-50">
                            3
                        </button>
                        <span className="text-gray-300 font-black">...</span>
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 text-gray-600 font-bold text-sm transition-all hover:bg-gray-50">
                            129
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 text-gray-400 transition-all hover:bg-gray-50">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-8">
                <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileText className="w-8 h-8 text-[#f47c20] opacity-30" />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Logs (24H)</p>
                        <h4 className="text-3xl font-black text-gray-900">{stats.total}</h4>
                    </div>
                </div>

                <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Zap className="w-8 h-8 text-emerald-500 opacity-30" />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">New Registrations</p>
                        <h4 className="text-3xl font-black text-gray-900">{stats.registrations}</h4>
                    </div>
                </div>

                <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
                    <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <AlertTriangle className="w-8 h-8 text-amber-500 opacity-30" />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Config Changes</p>
                        <h4 className="text-3xl font-black text-gray-900">{stats.changes}</h4>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
