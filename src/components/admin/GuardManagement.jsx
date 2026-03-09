import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, MoreVertical, MapPin } from 'lucide-react';
import RegisterGuard from './RegisterGuard';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';

// Helper function to generate a consistent color from a name
const stringToColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
};

const GuardManagement = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [isRegistering, setIsRegistering] = useState(false);
    const [guards, setGuards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const tabs = [
        { key: 'all', label: 'All Guards' },
        { key: 'active', label: 'Active' },
        { key: 'offline', label: 'Offline' },
    ];

    useEffect(() => {
        fetchGuards();
    }, [isRegistering]);

    const fetchGuards = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('guards')
                .select(`
                    *,
                    guard_gates ( name ),
                    guard_shifts ( name )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setGuards(data || []);
        } catch (error) {
            console.error('Error fetching guards:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter guards based on activeTab
    const filteredGuards = guards.filter(() => {
        if (activeTab === 'all') return true;
        if (activeTab === 'active') return true; // Hardcoded active for now
        return false;
    });

    return (
        <>
            {isRegistering ? (
                <RegisterGuard onCancel={() => setIsRegistering(false)} />
            ) : (
                <div className="flex-1 overflow-y-auto p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-[26px] font-bold text-gray-900 mb-1">Guard Directory</h1>
                            <p className="text-sm text-gray-500 font-medium">Manage and monitor security personnel across all gates.</p>
                        </div>
                        <button
                            onClick={() => setIsRegistering(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            Register Guard
                        </button>
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-3 gap-5 mb-8">
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-r-full"></div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 ml-3">Total Guards</p>
                            <h3 className="text-[28px] font-bold text-gray-900 leading-tight ml-3">
                                {isLoading ? '...' : guards.length}
                            </h3>
                        </div>

                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-r-full"></div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 ml-3">Active Now</p>
                            <h3 className="text-[28px] font-bold text-emerald-600 leading-tight ml-3">
                                {isLoading ? '...' : guards.length}
                            </h3>
                        </div>

                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 rounded-r-full"></div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 ml-3">On Break</p>
                            <h3 className="text-[28px] font-bold text-amber-600 leading-tight ml-3">0</h3>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-6 border-b border-gray-100 mb-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === tab.key ? 'text-[#f47c20]' : 'text-gray-400 hover:text-gray-600'
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
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-400">Loading guards...</td>
                                    </tr>
                                ) : filteredGuards.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-400">No guards found.</td>
                                    </tr>
                                ) : (
                                    filteredGuards.map((guard) => (
                                        <tr key={guard.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {guard.photo_url ? (
                                                        <img src={guard.photo_url} alt="" className="w-9 h-9 rounded-full object-cover border border-gray-100" />
                                                    ) : (
                                                        <div
                                                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                                            style={{ backgroundColor: stringToColor(guard.full_name) }}
                                                        >
                                                            {guard.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-sm">{guard.full_name}</p>
                                                        <p className="text-xs text-gray-400 font-medium">{guard.employee_id || 'Security personnel'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    ACTIVE
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                                    <span className="text-base text-gray-400"><MapPin size={16} /></span>
                                                    {guard.guard_gates?.name || 'Unassigned'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 font-medium">{guard.contact_number}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                                {guard.created_at ? `${formatDistanceToNow(new Date(guard.created_at))} ago` : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* Pagination footer - simplified for now */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                            <p className="text-sm text-gray-400 font-medium">Showing {filteredGuards.length} guards</p>
                            <div className="flex items-center gap-1">
                                <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center bg-[#f47c20] text-white rounded-lg text-sm font-bold">1</button>
                                <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GuardManagement;
