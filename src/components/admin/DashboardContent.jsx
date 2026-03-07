import React from 'react';
import { Shield, ArrowRight, AlertTriangle, UserPlus, BarChart2, Zap, GraduationCap, FileText, CheckCircle2, XCircle } from 'lucide-react';

const DashboardContent = ({ onNavigate }) => {
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
                    <h3 className="text-[26px] font-bold text-gray-900 leading-tight">12,450</h3>
                </div>

                {/* Total Guards */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-4">
                        <Shield className="w-5 h-5 text-[#f47c20] opacity-80" />
                        <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-full">-1.2%</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.05em] mb-1">Total Guards</p>
                    <h3 className="text-[26px] font-bold text-gray-900 leading-tight">48</h3>
                </div>

                {/* Active Passes */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-4">
                        <FileText className="w-5 h-5 text-[#f47c20] opacity-80" />
                        <span className="text-[11px] font-bold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full">+15%</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.05em] mb-1">Active Passes</p>
                    <h3 className="text-[26px] font-bold text-gray-900 leading-tight">856</h3>
                </div>

                {/* Recent Alerts */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-4">
                        <AlertTriangle className="w-5 h-5 text-[#f47c20] opacity-80" />
                        <span className="text-[11px] font-bold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full">+2%</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.05em] mb-1">Recent Alerts</p>
                    <h3 className="text-[26px] font-bold text-gray-900 leading-tight">12</h3>
                </div>
            </div>

            {/* Middle Row */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                {/* Recent Activity */}
                <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 text-[16px]">Recent Activity</h3>
                        <button className="text-[13px] font-bold text-[#f47c20] hover:text-[#d96a18] transition-colors">View All</button>
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
                                <tr className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">JD</div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">James Dawkins</p>
                                                <p className="text-[11px] text-gray-400 font-medium">ID: 450912</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-semibold text-gray-700">North Gate A</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-emerald-100">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            Entry
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className="text-xs text-gray-400 font-medium">2 mins ago</p>
                                    </td>
                                </tr>

                                <tr className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">SK</div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">Sarah Kong</p>
                                                <p className="text-[11px] text-gray-400 font-medium">ID: 881203</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-semibold text-gray-700">East Portal 2</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-orange-100">
                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                            Exit
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className="text-xs text-gray-400 font-medium">14 mins ago</p>
                                    </td>
                                </tr>

                                <tr className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xs font-bold">MR</div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">Marcus Reed</p>
                                                <p className="text-[11px] text-gray-400 font-medium">ID: 221004</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-semibold text-gray-700">Main Entrance</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-red-100">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                            Denied
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className="text-xs text-gray-400 font-medium">45 mins ago</p>
                                    </td>
                                </tr>
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

                        <button className="w-full bg-[#f47c20] hover:bg-[#e06d1c] text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg active:scale-[0.98]">
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

                <button className="flex items-center gap-5 bg-white hover:bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl p-6 transition-all shadow-sm group hover:translate-y-[-2px] active:scale-[0.98]">
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

