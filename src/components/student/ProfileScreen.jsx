import React from 'react';
import { ChevronLeft, Edit2, GraduationCap, Mail, Shield, Bell, Globe, LogOut } from 'lucide-react';

const ProfileScreen = ({ studentData, onLogout }) => {
    const initials = studentData?.full_name
        ? studentData.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : '??';

    // Extract department short name
    const deptShort = studentData?.departments?.name
        ? studentData.departments.name.split(' ').map(w => w[0]).join('').toUpperCase()
        : 'DEPT';

    const yearLabel = `${studentData?.year_of_study || '1'}${studentData?.year_of_study === 1 ? 'st' :
        studentData?.year_of_study === 2 ? 'nd' :
            studentData?.year_of_study === 3 ? 'rd' : 'th'
        } Year`;

    const settingsItems = [
        { icon: Shield, label: 'Security & Password', value: '', chevron: true },
        { icon: Bell, label: 'Notifications', value: '', chevron: true },
        { icon: Globe, label: 'App Language', value: 'English', chevron: true },
    ];

    return (
        <div className="flex-1 flex flex-col bg-[#f8f9fb] overflow-hidden">
            {/* Header */}
            <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-100 shadow-sm">
                <div className="flex items-center">
                    <h1 className="text-xl font-black text-gray-900">Student Profile</h1>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pb-28">
                {/* Profile Card */}
                <div className="flex flex-col items-center pt-8 pb-6 bg-white mx-5 mt-5 rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-50">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-full border-[3px] border-[#f47c20] p-1 mb-4">
                        <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                            {studentData?.photo_url ? (
                                <img
                                    src={studentData.photo_url}
                                    alt={studentData.full_name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-[#f47c20] flex items-center justify-center text-white text-2xl font-black">
                                    {initials}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Name & ID */}
                    <h2 className="text-xl font-black text-gray-900 mb-1">{studentData?.full_name || 'Student'}</h2>
                    <p className="text-sm text-gray-400 font-bold mb-3">ID: {studentData?.student_id || 'N/A'}</p>

                    {/* Badges */}
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full border border-gray-200 text-xs font-bold text-gray-600 bg-gray-50">
                            {deptShort}
                        </span>
                        <span className="px-3 py-1 rounded-full border border-gray-200 text-xs font-bold text-gray-600 bg-gray-50">
                            {yearLabel}
                        </span>
                    </div>
                </div>

                {/* Personal Information */}
                <div className="px-5 mt-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mb-3 pl-1">
                        Personal Information
                    </p>
                    <div className="space-y-3">
                        {/* Department */}
                        <div className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-50 flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                                <GraduationCap className="w-5 h-5 text-[#f47c20]" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-400 font-medium">Department</p>
                                <p className="text-sm font-bold text-gray-900 truncate">
                                    {studentData?.departments?.name || 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-50 flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                                <Mail className="w-5 h-5 text-[#f47c20]" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-400 font-medium">University Email</p>
                                <p className="text-sm font-bold text-gray-900 truncate">
                                    {studentData?.email || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Settings */}
                <div className="px-5 mt-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mb-3 pl-1">
                        Account Settings
                    </p>
                    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-50 overflow-hidden divide-y divide-gray-50">
                        {settingsItems.map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={i}
                                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors active:scale-[0.99]"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                                        <Icon className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <span className="flex-1 text-sm font-bold text-gray-900 text-left">{item.label}</span>
                                    {item.value && (
                                        <span className="text-xs font-medium text-gray-400 mr-1">{item.value}</span>
                                    )}
                                    {item.chevron && (
                                        <ChevronLeft className="w-4 h-4 text-gray-300 rotate-180" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Sign Out */}
                <div className="px-5 mt-8">
                    <button
                        onClick={onLogout}
                        className="w-full py-4 bg-red-50 border border-red-100 text-red-500 font-black rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>

                {/* Version */}
                <p className="text-center text-[10px] text-gray-300 font-bold mt-4 mb-6 uppercase tracking-widest">
                    Vishnu Pass V2.4.0
                </p>
            </div>
        </div>
    );
};

export default ProfileScreen;
