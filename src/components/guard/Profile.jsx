import React from 'react';
import { LogOut, Shield, Phone, Mail, ChevronRight, Bell, ShieldCheck, Heart } from 'lucide-react';

const GuardProfile = ({ guardData, onLogout, onNavigate }) => {
    const initials = guardData?.full_name
        ? guardData.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : 'GP';

    const menuItems = [
        { icon: <Bell className="w-5 h-5 text-blue-500" />, label: 'Notification Settings', description: 'Alerts for unauthorized access attempts', tab: 'notifications' },
        { icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />, label: 'Security & Privacy', description: 'Manage your login credentials', tab: 'security' },
        { icon: <Heart className="w-5 h-5 text-rose-500" />, label: 'Emergency Contacts', description: 'Update your standby contact info', tab: 'emergency' },
    ];

    return (
        <div className="flex flex-col min-h-full">
            {/* Header Section */}
            <div className="bg-[#1e293b] px-6 pt-12 pb-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#f47c20]/10 rounded-full -mr-20 -mt-20 blur-3xl" />

                <div className="flex flex-col items-center text-center relative z-10">
                    <div className="w-24 h-24 rounded-[32px] bg-white p-1 shadow-2xl relative group mb-4">
                        <div className="w-full h-full rounded-[28px] overflow-hidden bg-slate-100 flex items-center justify-center text-[#1e293b] text-3xl font-black">
                            {guardData?.photo_url ? (
                                <img src={guardData.photo_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span>{initials}</span>
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center text-white">
                            <Shield className="w-4 h-4 fill-current" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-white tracking-tight">{guardData?.full_name}</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-1">Campus Security Officer</p>

                    <div className="mt-4 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Currently on Duty
                        </p>
                    </div>
                </div>
            </div>

            {/* Profile Content */}
            <div className="px-6 -mt-16 relative z-20 space-y-6 pb-10">
                {/* Contact & ID Info Card */}
                <div className="bg-white rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 overflow-hidden">
                    <div className="p-8 grid grid-cols-2 gap-y-6 gap-x-4">
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Employee ID</p>
                            <div className="flex items-center gap-2 text-slate-700 font-bold">
                                <Shield className="w-4 h-4 text-[#f47c20]" />
                                {guardData?.employee_id || 'ID-XXX'}
                            </div>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Phone Number</p>
                            <div className="flex items-center gap-2 text-slate-700 font-bold">
                                <Phone className="w-4 h-4 text-[#f47c20]" />
                                {guardData?.contact_number || 'N/A'}
                            </div>
                        </div>
                        <div className="col-span-2 pt-4 border-t border-gray-50">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email Address</p>
                            <div className="flex items-center gap-2 text-slate-700 font-bold">
                                <Mail className="w-4 h-4 text-[#f47c20]" />
                                {guardData?.email || 'officer@vishnu.edu'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Menu */}
                <div className="bg-white rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 p-6 space-y-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 mb-4">Account Management</h3>
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => onNavigate && onNavigate(item.tab)}
                            className="w-full flex items-center justify-between p-4 rounded-3xl hover:bg-slate-50 transition-all group active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all">
                                    {item.icon}
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-slate-800">{item.label}</p>
                                    <p className="text-[10px] font-medium text-slate-400">{item.description}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
                        </button>
                    ))}
                </div>

                {/* Logout Button */}
                <button
                    onClick={onLogout}
                    className="w-full py-5 bg-rose-50 text-rose-600 font-bold rounded-[30px] flex items-center justify-center gap-3 border border-rose-100/50 hover:bg-rose-100 transition-colors active:scale-95"
                >
                    <LogOut className="w-5 h-5" />
                    SIGNOUT FROM PORTAL
                </button>

                <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] py-4">
                    Vishnu Pass v1.0 • Security Node
                </p>
            </div>
        </div>
    );
};

export default GuardProfile;
