import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, MoreVertical, Phone, MapPin } from 'lucide-react';

const guards = [
    {
        name: 'Michael Chen',
        role: 'Senior Security',
        status: 'ACTIVE',
        gate: 'Main Entrance A',
        gateIcon: '🚪',
        phone: '+1 (555) 012-3456',
        lastActivity: '2 mins ago',
        avatar: '#1e40af',
    },
    {
        name: 'Sarah Johnson',
        role: 'Patrol Officer',
        status: 'ACTIVE',
        gate: 'North Gate B',
        gateIcon: '🏗️',
        phone: '+1 (555) 012-3457',
        lastActivity: '15 mins ago',
        avatar: '#7c3aed',
    },
    {
        name: 'Robert Smith',
        role: 'Gate Supervisor',
        status: 'OFFLINE',
        gate: 'Unassigned',
        gateIcon: '👁️',
        phone: '+1 (555) 012-3458',
        lastActivity: '6 hours ago',
        avatar: '#059669',
    },
];

const GuardManagement = () => {
    const [activeTab, setActiveTab] = useState('all');

    const tabs = [
        { key: 'all', label: 'All Guards' },
        { key: 'active', label: 'Active' },
        { key: 'offline', label: 'Offline' },
    ];

    return (
        <div className="flex-1 overflow-y-auto p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-[26px] font-bold text-gray-900 mb-1">Guard Directory</h1>
                    <p className="text-sm text-gray-500 font-medium">Manage and monitor security personnel across all gates.</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                    Register Guard
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-5 mb-8">
                {/* Total Guards */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-r-full"></div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 ml-3">Total Guards</p>
                    <h3 className="text-[28px] font-bold text-gray-900 leading-tight ml-3">24</h3>
                </div>

                {/* Active Now */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-r-full"></div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 ml-3">Active Now</p>
                    <h3 className="text-[28px] font-bold text-emerald-600 leading-tight ml-3">18</h3>
                </div>

                {/* On Break */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 rounded-r-full"></div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 ml-3">On Break</p>
                    <h3 className="text-[28px] font-bold text-amber-600 leading-tight ml-3">4</h3>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-gray-100 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === tab.key
                                ? 'text-[#f47c20]'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.key && (
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#f47c20] rounded-full"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Guard Member</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Assigned Gate</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Info</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Last Activity</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {guards.map((guard, index) => (
                            <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                            style={{ backgroundColor: guard.avatar }}
                                        >
                                            {guard.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">{guard.name}</p>
                                            <p className="text-xs text-gray-400 font-medium">{guard.role}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${guard.status === 'ACTIVE' ? 'text-emerald-600' : 'text-gray-400'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${guard.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-300'
                                            }`}></span>
                                        {guard.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                        <span className="text-base">{guard.gateIcon}</span>
                                        {guard.gate}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 font-medium">{guard.phone}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 font-medium">{guard.lastActivity}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                    <p className="text-sm text-gray-400 font-medium">Showing 3 of 24 guards</p>
                    <div className="flex items-center gap-1">
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center bg-[#f47c20] text-white rounded-lg text-sm font-bold">1</button>
                        <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">2</button>
                        <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">3</button>
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuardManagement;
