import React from 'react';
import { Search, Bell, Shield, ArrowRight, AlertTriangle, Plus, UserPlus, BarChart2, Settings } from 'lucide-react';

const DashboardContent = () => {
    return (
        <div className="flex-1 overflow-y-auto p-8">
            {/* Welcome */}
            <div className="mb-8">
                <h1 className="text-[26px] font-bold text-gray-900 mb-1">Welcome back, Vishnu Admin</h1>
                <p className="text-gray-500 text-sm font-medium">Real-time campus security and gate monitoring dashboard.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-5 mb-8">
                {/* Total Students */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        </div>
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">+2.5%</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Students</p>
                    <h3 className="text-[28px] font-bold text-gray-900 leading-tight">12,450</h3>
                </div>

                {/* Total Guards */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                            <Shield className="w-5 h-5 text-[#f47c20]" />
                        </div>
                        <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">-1.2%</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Guards</p>
                    <h3 className="text-[28px] font-bold text-gray-900 leading-tight">48</h3>
                </div>

                {/* Active Passes */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                        </div>
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">+15%</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Active Passes</p>
                    <h3 className="text-[28px] font-bold text-gray-900 leading-tight">856</h3>
                </div>

                {/* Recent Alerts */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">+2%</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Recent Alerts</p>
                    <h3 className="text-[28px] font-bold text-gray-900 leading-tight">12</h3>
                </div>
            </div>

            {/* Middle Row: Activity + System Status */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                {/* Recent Activity */}
                <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="p-5 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 text-[15px]">Recent Activity</h3>
                        <button className="text-sm font-semibold text-[#f47c20] hover:text-[#d96a18] transition-colors">View All</button>
                    </div>
                    <div className="divide-y divide-gray-50">
                        <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <ArrowRight className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900">Student Entry: Rahul Sharma</p>
                                <p className="text-xs text-gray-400 font-medium">Gate #2 (South Campus) • 2 mins ago</p>
                            </div>
                            <span className="text-xs text-gray-400 font-medium flex-shrink-0">08:42 AM</span>
                        </div>

                        <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4" /><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900">Pass Approved: Visitor ID #4421</p>
                                <p className="text-xs text-gray-400 font-medium">Approved by Vishnu Admin • 15 mins ago</p>
                            </div>
                            <span className="text-xs text-gray-400 font-medium flex-shrink-0">08:29 AM</span>
                        </div>

                        <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-[#f47c20]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900">Overdue Student Exit: Priya K.</p>
                                <p className="text-xs text-gray-400 font-medium">Hostel Pass Expired (30m delay) • 42 mins ago</p>
                            </div>
                            <span className="text-xs text-gray-400 font-medium flex-shrink-0">08:02 AM</span>
                        </div>

                        <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Settings className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900">System Configuration Changed</p>
                                <p className="text-xs text-gray-400 font-medium">Gate #1 scanner sensitivity adjusted • 1h ago</p>
                            </div>
                            <span className="text-xs text-gray-400 font-medium flex-shrink-0">07:45 AM</span>
                        </div>
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 flex flex-col">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-8 h-8 bg-[#fff4eb] rounded-lg flex items-center justify-center">
                            <Shield className="w-4 h-4 text-[#f47c20]" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-[15px]">System Status</h3>
                    </div>

                    <div className="mb-5">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600 font-medium">API Health</span>
                            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                                Healthy
                            </span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 rounded-full" style={{ width: '95%' }}></div>
                        </div>
                    </div>

                    <div className="mb-5">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600 font-medium">Server Uptime</span>
                            <span className="text-sm font-bold text-gray-900">99.98%</span>
                        </div>
                        <div className="flex gap-[3px]">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div key={i} className={`flex-1 h-5 rounded-sm ${i === 14 ? 'bg-emerald-200' : 'bg-emerald-400'}`} />
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Last Maintenance</p>
                        <p className="text-sm font-semibold text-gray-900">Oct 24, 2023 • 02:00 AM</p>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Quick Actions + Gate Efficiency */}
            <div className="grid grid-cols-4 gap-5">
                <button className="bg-[#f47c20] hover:bg-[#e06d1c] text-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-colors shadow-sm group">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <UserPlus className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-sm">Register Student</span>
                </button>

                <button className="bg-white hover:bg-gray-50 border border-gray-100 text-gray-700 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.04)] group">
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-[#f47c20]" />
                    </div>
                    <span className="font-bold text-sm">Issue Emergency Pass</span>
                </button>

                <button className="bg-white hover:bg-gray-50 border border-gray-100 text-gray-700 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.04)] group">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                        <BarChart2 className="w-6 h-6 text-indigo-500" />
                    </div>
                    <span className="font-bold text-sm">View Reports</span>
                </button>

                <div className="bg-[#f47c20] rounded-2xl p-5 text-white shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-[40px] pointer-events-none"></div>
                    <h4 className="font-bold text-[15px] mb-4">Gate Efficiency</h4>
                    <div className="space-y-3 mb-5">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-white/80 font-medium">Avg. Wait Time</span>
                            <span className="text-2xl font-bold">1.2m</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-white/80 font-medium">Scans/Hour</span>
                            <span className="text-2xl font-bold">142</span>
                        </div>
                    </div>
                    <button className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                        Optimize Flow
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardContent;
