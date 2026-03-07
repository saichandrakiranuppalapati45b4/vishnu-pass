import React from 'react';
import { ChevronDown, MoreVertical, TrendingUp, Clock, ArrowUpRight } from 'lucide-react';

const logs = [
    {
        name: 'John Doe',
        id: 'ID: #VP-3029',
        accessPoint: 'North Gate 02',
        type: 'AUTHORIZED',
        typeColor: 'text-blue-600 bg-blue-50',
        status: 'Success',
        statusColor: 'text-emerald-600',
        timestamp: '2023-11-24 14:23:18',
        avatar: '#4f46e5',
    },
    {
        name: 'Marcus Smith',
        id: 'ID: #VP-8821',
        accessPoint: 'South Cargo Gate',
        type: 'MANUAL OVERRIDE',
        typeColor: 'text-amber-600 bg-amber-50',
        status: 'Success',
        statusColor: 'text-emerald-600',
        timestamp: '2023-11-24 14:18:45',
        avatar: '#059669',
    },
];

// SVG path for the wave chart
const chartPath = 'M 30 140 C 60 140, 70 60, 100 80 C 130 100, 140 40, 170 50 C 200 60, 210 130, 240 120 C 270 110, 280 30, 310 40 C 340 50, 350 100, 380 110 C 410 120, 420 60, 450 70 C 480 80, 490 140, 520 130';
const chartFill = 'M 30 140 C 60 140, 70 60, 100 80 C 130 100, 140 40, 170 50 C 200 60, 210 130, 240 120 C 270 110, 280 30, 310 40 C 340 50, 350 100, 380 110 C 410 120, 420 60, 450 70 C 480 80, 490 140, 520 130 L 520 180 L 30 180 Z';

const Reports = () => {
    return (
        <div className="flex-1 overflow-y-auto p-8">

            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-5 mb-8">
                {/* Total Movement */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Movement</p>
                        <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-red-500" />
                        </div>
                    </div>
                    <h3 className="text-[28px] font-bold text-gray-900 leading-tight mb-1">12,840</h3>
                    <p className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" />
                        +5.2% from last week
                    </p>
                </div>

                {/* Peak Hour */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Peak Hour</p>
                        <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                            <Clock className="w-4 h-4 text-[#f47c20]" />
                        </div>
                    </div>
                    <h3 className="text-[28px] font-bold text-gray-900 leading-tight mb-1">14:00 - 15:00</h3>
                    <p className="text-xs text-gray-400 font-medium">Average 842 entries/hr</p>
                </div>

                {/* Weekly Increase */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Weekly Increase</p>
                        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                        </div>
                    </div>
                    <h3 className="text-[28px] font-bold text-emerald-600 leading-tight mb-1">+12.5%</h3>
                    <p className="text-xs text-gray-400 font-medium">Compared to previous period</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-5 gap-6 mb-8">
                {/* Gate Activity Trends */}
                <div className="col-span-3 bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className="font-bold text-gray-900 text-[15px] mb-1">Gate Activity Trends</h3>
                            <p className="text-xs text-gray-400 font-medium">Activity volume for the last 7 days</p>
                        </div>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                            Last 7 Days
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                    </div>

                    {/* Chart SVG */}
                    <div className="mt-4">
                        <svg viewBox="0 0 550 200" className="w-full h-[180px]" preserveAspectRatio="none">
                            {/* Grid lines */}
                            <line x1="30" y1="40" x2="520" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                            <line x1="30" y1="80" x2="520" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                            <line x1="30" y1="120" x2="520" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                            <line x1="30" y1="160" x2="520" y2="160" stroke="#f1f5f9" strokeWidth="1" />

                            {/* Fill area */}
                            <path d={chartFill} fill="url(#orangeGradient)" />

                            {/* Line */}
                            <path d={chartPath} fill="none" stroke="#f47c20" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                            {/* Dots at peaks */}
                            <circle cx="170" cy="50" r="4" fill="#f47c20" />
                            <circle cx="310" cy="40" r="4" fill="#f47c20" />
                            <circle cx="450" cy="70" r="4" fill="#f47c20" />

                            {/* Gradient definition */}
                            <defs>
                                <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f47c20" stopOpacity="0.15" />
                                    <stop offset="100%" stopColor="#f47c20" stopOpacity="0.01" />
                                </linearGradient>
                            </defs>
                        </svg>
                        {/* X-axis labels */}
                        <div className="flex justify-between px-4 mt-1">
                            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
                                <span key={day} className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">{day}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Access Types Donut */}
                <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                    <div className="mb-4">
                        <h3 className="font-bold text-gray-900 text-[15px] mb-1">Access Types</h3>
                        <p className="text-xs text-gray-400 font-medium">Breakdown of entry authorization</p>
                    </div>

                    {/* Donut Chart */}
                    <div className="flex items-center justify-center mb-5">
                        <div className="relative">
                            <svg width="160" height="160" viewBox="0 0 160 160">
                                {/* Background */}
                                <circle cx="80" cy="80" r="60" fill="none" stroke="#f1f5f9" strokeWidth="20" />
                                {/* Authorized - 70% = 252° */}
                                <circle cx="80" cy="80" r="60" fill="none" stroke="#f47c20" strokeWidth="20"
                                    strokeDasharray="264 376.99"
                                    strokeDashoffset="0"
                                    transform="rotate(-90 80 80)"
                                    strokeLinecap="round"
                                />
                                {/* Manual Override - 20% = 72° */}
                                <circle cx="80" cy="80" r="60" fill="none" stroke="#7c3aed" strokeWidth="20"
                                    strokeDasharray="75.4 376.99"
                                    strokeDashoffset="-264"
                                    transform="rotate(-90 80 80)"
                                    strokeLinecap="round"
                                />
                                {/* Guest Access - 10% = 36° */}
                                <circle cx="80" cy="80" r="60" fill="none" stroke="#84cc16" strokeWidth="20"
                                    strokeDasharray="37.7 376.99"
                                    strokeDashoffset="-339.4"
                                    transform="rotate(-90 80 80)"
                                    strokeLinecap="round"
                                />
                            </svg>
                            {/* Center text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-gray-900">2.4k</span>
                                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Daily Avg</span>
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#f47c20]"></span>
                                <span className="text-sm text-gray-600 font-medium">Authorized</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">70%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#7c3aed]"></span>
                                <span className="text-sm text-gray-600 font-medium">Manual Override</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">20%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#84cc16]"></span>
                                <span className="text-sm text-gray-600 font-medium">Guest Access</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">10%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Logs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="p-5 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 text-[15px]">Recent Logs</h3>
                    <div className="flex items-center gap-3">
                        <button className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">Filter</button>
                        <button className="text-sm font-semibold text-[#f47c20] hover:text-[#d96a18] transition-colors">View All</button>
                    </div>
                </div>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">User Details</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Access Point</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {logs.map((log, index) => (
                            <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                            style={{ backgroundColor: log.avatar }}
                                        >
                                            {log.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">{log.name}</p>
                                            <p className="text-xs text-gray-400 font-medium">{log.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 font-medium">{log.accessPoint}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${log.typeColor}`}>
                                        {log.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-sm font-semibold ${log.statusColor} flex items-center gap-1.5`}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        {log.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500 font-medium text-sm">{log.timestamp}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Reports;
