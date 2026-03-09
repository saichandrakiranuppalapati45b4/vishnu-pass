import React from 'react';
import { ChevronLeft, Mail, Phone, MapPin, Clock, Calendar, Shield, CreditCard, Droplets } from 'lucide-react';
import { format } from 'date-fns';

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

const GuardProfile = ({ guard, onBack, onEdit }) => {
    if (!guard) return null;

    const initials = guard.full_name
        ? guard.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : 'GP';

    return (
        <div className="flex-1 overflow-y-auto bg-[#f8f9fb]">
            {/* Header / Top Navigation */}
            <div className="bg-white px-8 py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-900"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Guard Profile</h1>
                        <p className="text-sm text-gray-500 font-medium">Detailed information and activity</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onEdit(guard)}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Edit Profile
                    </button>
                </div>
            </div>

            <div className="p-8 max-w-5xl mx-auto space-y-6">
                {/* Main Profile Card */}
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
                    {/* Cover Banner */}
                    <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-700 relative">
                        {/* Status Badge */}
                        <div className="absolute top-6 right-6 px-3 py-1.5 bg-emerald-500/20 text-emerald-100 border border-emerald-500/30 rounded-full text-xs font-bold tracking-wider flex items-center gap-2 backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            ACTIVE NOW
                        </div>
                    </div>

                    <div className="px-8 pb-8">
                        {/* Avatar & Name Section */}
                        <div className="relative flex justify-between items-end -mt-12 mb-6">
                            <div className="flex items-end gap-6">
                                <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white">
                                    {guard.photo_url ? (
                                        <img src={guard.photo_url} alt={guard.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div
                                            className="w-full h-full flex items-center justify-center text-white text-3xl font-bold"
                                            style={{ backgroundColor: stringToColor(guard.full_name) }}
                                        >
                                            {initials}
                                        </div>
                                    )}
                                </div>
                                <div className="pb-2">
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">{guard.full_name}</h2>
                                    <div className="flex items-center gap-3 mt-1 text-gray-500 font-medium">
                                        <span className="flex items-center gap-1.5">
                                            <Shield className="w-4 h-4 text-emerald-500" />
                                            Security Personnel
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                        <span>Joined {guard.created_at ? format(new Date(guard.created_at), 'MMMM yyyy') : 'Recently'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-gray-50">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Employee ID</p>
                                <div className="flex items-center gap-2 font-semibold text-gray-900">
                                    <CreditCard className="w-4 h-4 text-gray-400" />
                                    {guard.employee_id || 'N/A'}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Phone Number</p>
                                <div className="flex items-center gap-2 font-semibold text-gray-900">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    {guard.contact_number || 'N/A'}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Assigned Gate</p>
                                <div className="flex items-center gap-2 font-semibold text-gray-900">
                                    <MapPin className="w-4 h-4 text-blue-500" />
                                    {guard.guard_gates?.name || 'Unassigned'}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Current Shift</p>
                                <div className="flex items-center gap-2 font-semibold text-gray-900">
                                    <Clock className="w-4 h-4 text-orange-500" />
                                    {guard.guard_shifts?.name || 'Unassigned'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Additional Details */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Personal Information */}
                        <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                                Personal Information
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Blood Group</p>
                                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                                        <Droplets className="w-4 h-4 text-red-500" />
                                        {guard.blood_group || 'Not Specified'}
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-50">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date of Birth</p>
                                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        {guard.date_of_birth ? format(new Date(guard.date_of_birth), 'MMMM dd, yyyy') : 'Not Specified'}
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-50">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Address</p>
                                    <div className="font-semibold text-gray-900 text-sm leading-relaxed">
                                        {guard.address || 'Address not provided in the system.'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Activity/Stats */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Placeholder for Activity Logs */}
                        <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 min-h-[400px]">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">View All Logs</button>
                            </div>

                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Clock className="w-8 h-8 text-gray-300" />
                                </div>
                                <h4 className="text-base font-bold text-gray-900 mb-1">No Recent Activity</h4>
                                <p className="text-sm text-gray-500 max-w-sm">Activity logs for this guard will appear here once they start scanning passes or recording incidents.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuardProfile;
