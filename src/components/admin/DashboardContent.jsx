import React, { useState, useEffect, useCallback } from 'react';
import { Shield, AlertTriangle, UserPlus, BarChart2, Zap, GraduationCap, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';

const DashboardContent = ({ onNavigate }) => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalGuards: 0,
        activePasses: 0, // Placeholder for now
        recentAlerts: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            // Fetch counts in parallel
            const [studentsCount, guardsCount, alertsCount, activityLogs] = await Promise.all([
                supabase.from('students').select('*', { count: 'exact', head: true }),
                supabase.from('guards').select('*', { count: 'exact', head: true }),
                supabase.from('movement_logs').select('*', { count: 'exact', head: true }).neq('status', 'Success'),
                supabase.from('movement_logs').select('*, guard_gates(name)').order('created_at', { ascending: false }).limit(5)
            ]);

            setStats({
                totalStudents: studentsCount.count || 0,
                totalGuards: guardsCount.count || 0,
                activePasses: 12, // Placeholder
                recentAlerts: alertsCount.count || 0
            });

            setRecentActivity(activityLogs.data || []);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();

        // Real-time updates
        const channel = supabase
            .channel('dashboard_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'movement_logs' }, () => {
                fetchDashboardData(false);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
                fetchDashboardData(false);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchDashboardData]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50/30">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-[#f47c20] animate-spin" />
                    <p className="text-sm font-semibold text-gray-500">Synchronizing live portal data...</p>
                </div>
            </div>
        );
    }
    return (
        <div className="flex-1 overflow-y-auto p-8">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-5 mb-8">
                {/* Total Students */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-4">
                        <GraduationCap className="w-5 h-5 text-[#f47c20] opacity-80" />
                        <span className="text-[11px] font-bold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full">+2.5%</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.05em] mb-1">Total Students</p>
                    <h3 className="text-[26px] font-bold text-gray-900 leading-tight">{stats.totalStudents.toLocaleString()}</h3>
                </div>

                {/* Total Guards */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-4">
                        <Shield className="w-5 h-5 text-[#f47c20] opacity-80" />
                        <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-full">-1.2%</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.05em] mb-1">Total Guards</p>
                    <h3 className="text-[26px] font-bold text-gray-900 leading-tight">{stats.totalGuards.toLocaleString()}</h3>
                </div>

                {/* Active Passes */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-4">
                        <FileText className="w-5 h-5 text-[#f47c20] opacity-80" />
                        <span className="text-[11px] font-bold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full">+15%</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.05em] mb-1">Active Passes</p>
                    <h3 className="text-[26px] font-bold text-gray-900 leading-tight">{stats.activePasses.toLocaleString()}</h3>
                </div>

                {/* Recent Alerts */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-4">
                        <AlertTriangle className="w-5 h-5 text-[#f47c20] opacity-80" />
                        <span className="text-[11px] font-bold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full">+2%</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.05em] mb-1">Recent Alerts</p>
                    <h3 className="text-[26px] font-bold text-gray-900 leading-tight">{stats.recentAlerts.toLocaleString()}</h3>
                </div>
            </div>

            {/* Middle Row */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                {/* Recent Activity */}
                <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 text-[16px]">Recent Activity</h3>
                        <button
                            onClick={() => onNavigate('reports')}
                            className="text-[13px] font-bold text-[#f47c20] hover:text-[#d96a18] transition-colors"
                        >
                            View All
                        </button>
                    </div>
                    <div className="p-0">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#f8f9fb]">
                                    <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gate</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentActivity.map((log) => (
                                    <tr
                                        key={log.id}
                                        onClick={() => log.students?.id && onNavigate('student-profile', log.students.id)}
                                        className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {log.students?.photo_url ? (
                                                    <img src={log.students.photo_url} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-100" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#f47c20] text-[10px] font-bold">
                                                        {log.user_name ? log.user_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??'}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900 leading-tight">{log.user_name || 'Guest User'}</p>
                                                    <p className="text-[11px] text-gray-400 font-medium">ID: {log.student_id || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-gray-700">{log.guard_gates?.name || 'Gate'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${log.status === 'Success'
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : 'bg-red-50 text-red-600 border-red-100'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'Success' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                {log.movement_type === 'GUEST ACCESS' ? 'Guest' : (log.status === 'Success' ? 'Authorized' : 'Denied')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-xs text-gray-400 font-medium">
                                                {log.created_at ? formatDistanceToNow(new Date(log.created_at), { addSuffix: true }) : 'N/A'}
                                            </p>
                                        </td>
                                    </tr>
                                ))}
                                {recentActivity.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-400 text-sm font-medium">No recent activity detected</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* System Health */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart2 className="w-5 h-5 text-[#f47c20]" />
                            <h3 className="font-bold text-gray-900 text-[15px]">System Health</h3>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 font-medium">API Gateway</span>
                                <span className="text-sm font-bold text-emerald-500">Healthy</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 font-medium">Server Uptime</span>
                                <span className="text-sm font-bold text-gray-900">99.98%</span>
                            </div>
                        </div>

                        <div className="pt-5 border-t border-gray-50">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Last Maintenance</p>
                            <p className="text-[13px] font-bold text-gray-700">Oct 24, 2023 at 04:00 AM</p>
                        </div>
                    </div>

                    {/* Gate Efficiency - Dark Card */}
                    <div className="bg-[#111827] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
                        <Zap className="absolute top-4 right-4 w-12 h-12 text-white/5 group-hover:text-white/10 transition-colors pointer-events-none" />

                        <div className="flex items-center gap-2 mb-8">
                            <CheckCircle2 className="w-5 h-5 text-[#f47c20]" />
                            <h3 className="font-bold text-[15px]">Gate Efficiency</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Avg Wait Time</p>
                                <h4 className="text-2xl font-bold">1.2m</h4>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Scans / Hour</p>
                                <h4 className="text-2xl font-bold">142</h4>
                            </div>
                        </div>

                        <button
                            onClick={() => onNavigate('flow-optimization')}
                            className="w-full bg-[#f47c20] hover:bg-[#e06d1c] text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg active:scale-[0.98]"
                        >
                            Optimize Flow
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Row - Quick Actions */}
            <div className="grid grid-cols-3 gap-6">
                <button
                    onClick={() => onNavigate('register-student')}
                    className="flex items-center gap-5 bg-[#f47c20] hover:bg-[#e06d1c] text-white rounded-2xl p-6 transition-all shadow-md group hover:translate-y-[-2px] active:scale-[0.98]"
                >
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <UserPlus className="w-7 h-7" />
                    </div>
                    <div className="text-left">
                        <h4 className="font-bold text-[17px] mb-0.5">Register Student</h4>
                        <p className="text-xs text-white/80 font-medium">Add new student to portal</p>
                    </div>
                </button>

                <button className="flex items-center gap-5 bg-white hover:bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl p-6 transition-all shadow-sm group hover:translate-y-[-2px] active:scale-[0.98]">
                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Zap className="w-7 h-7 text-[#f47c20]" />
                    </div>
                    <div className="text-left">
                        <h4 className="font-bold text-[17px] mb-0.5 text-gray-900">Issue Emergency Pass</h4>
                        <p className="text-xs text-gray-400 font-medium">Generate temporary security QR</p>
                    </div>
                </button>

                <button
                    onClick={() => onNavigate('reports')}
                    className="flex items-center gap-5 bg-white hover:bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl p-6 transition-all shadow-sm group hover:translate-y-[-2px] active:scale-[0.98]"
                >
                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <FileText className="w-7 h-7 text-[#f47c20]" />
                    </div>
                    <div className="text-left">
                        <h4 className="font-bold text-[17px] mb-0.5 text-gray-900">View Reports</h4>
                        <p className="text-xs text-gray-400 font-medium">Export daily access logs</p>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default DashboardContent;

