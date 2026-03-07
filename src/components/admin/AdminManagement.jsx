import React from 'react';
import { UserPlus, Download, Filter, Shield, ChevronLeft, ChevronRight } from 'lucide-react';

const admins = [
    {
        name: 'Arjun Mehta',
        initials: 'AM',
        role: 'Super Admin',
        roleBadge: 'bg-[#f47c20] text-white',
        email: 'arjun@vishnupass.com',
        status: 'Active',
        statusColor: 'text-emerald-600',
        actions: ['Edit Role', 'Deactivate'],
        avatar: '#f47c20',
    },
    {
        name: 'Sita Rao',
        initials: 'SR',
        role: 'Manager',
        roleBadge: 'bg-blue-100 text-blue-700',
        email: 'sita.r@vishnupass.com',
        status: 'Active',
        statusColor: 'text-emerald-600',
        actions: ['Edit Role', 'Deactivate'],
        avatar: '#6366f1',
    },
    {
        name: 'Vikram Singh',
        initials: 'VS',
        role: 'Editor',
        roleBadge: 'bg-purple-100 text-purple-700',
        email: 'vikram@vishnupass.com',
        status: 'Inactive',
        statusColor: 'text-gray-400',
        actions: ['Edit Role', 'Activate'],
        avatar: '#059669',
    },
    {
        name: 'Priya Sharma',
        initials: 'PS',
        role: 'Manager',
        roleBadge: 'bg-blue-100 text-blue-700',
        email: 'priya.s@vishnupass.com',
        status: 'Active',
        statusColor: 'text-emerald-600',
        actions: ['Edit Role', 'Deactivate'],
        avatar: '#e11d48',
    },
];

const AdminManagement = () => {
    return (
        <div className="flex-1 overflow-y-auto p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-[26px] font-bold text-gray-900 mb-1">System Administrators</h1>
                    <p className="text-sm text-gray-500 font-medium">Manage system-wide permissions and portal access for staff members.</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#f47c20] hover:bg-[#e06d1c] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
                    <UserPlus className="w-4 h-4" />
                    Invite New Admin
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-5 mb-8">
                {/* Total Admins */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Admins</p>
                        <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                            <Shield className="w-4 h-4 text-red-500" />
                        </div>
                    </div>
                    <h3 className="text-[28px] font-bold text-gray-900 leading-tight">24</h3>
                </div>

                {/* Active Sessions */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Sessions</p>
                        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                        </div>
                    </div>
                    <h3 className="text-[28px] font-bold text-gray-900 leading-tight">8</h3>
                </div>

                {/* Pending Invites */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending Invites</p>
                        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 7L2 7" /></svg>
                        </div>
                    </div>
                    <h3 className="text-[28px] font-bold text-gray-900 leading-tight">3</h3>
                </div>
            </div>

            {/* Administrator List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden mb-8">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 text-[15px]">Administrator List</h3>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                            <Filter className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {admins.map((admin, index) => (
                            <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                            style={{ backgroundColor: admin.avatar }}
                                        >
                                            {admin.initials}
                                        </div>
                                        <span className="font-semibold text-gray-900 text-sm">{admin.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${admin.roleBadge}`}>
                                        {admin.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500 font-medium">{admin.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${admin.statusColor}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${admin.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                                        {admin.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">{admin.actions[0]}</button>
                                        <button className={`text-xs font-semibold transition-colors ${admin.actions[1] === 'Activate' ? 'text-emerald-600 hover:text-emerald-800' : 'text-red-500 hover:text-red-700'}`}>
                                            {admin.actions[1]}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                    <p className="text-sm text-gray-400 font-medium">Showing 4 of 24 administrators</p>
                    <div className="flex items-center gap-3">
                        <button className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
                            Previous
                        </button>
                        <button className="text-sm font-semibold text-[#f47c20] hover:text-[#d96a18] transition-colors flex items-center gap-1">
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Quick Help + Security Audit */}
            <div className="grid grid-cols-2 gap-6">
                {/* Quick Help */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                    <div className="flex items-center gap-2.5 mb-5">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                        </div>
                        <h3 className="font-bold text-gray-900 text-[15px]">Quick Help: Administrator Roles</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <span className="inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-[#f47c20] text-white flex-shrink-0 mt-0.5">
                                Super Admin
                            </span>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                Full access to all modules, including system settings and high-level user management.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-blue-100 text-blue-700 flex-shrink-0 mt-0.5">
                                Manager
                            </span>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                Can manage students and guards, generate reports, but cannot access system settings.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Security Audit */}
                <div className="bg-[#1e293b] rounded-2xl p-6 text-white shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-[50px] pointer-events-none"></div>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                            <Shield className="w-5 h-5 text-emerald-400" />
                        </div>
                    </div>
                    <h3 className="font-bold text-lg mb-3">Security Audit</h3>
                    <p className="text-sm text-white/60 font-medium leading-relaxed mb-5">
                        Last system-wide security audit was completed 2 days ago. No unusual administrative activity detected.
                    </p>
                    <button className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors border border-white/10">
                        View Audit Logs
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminManagement;
