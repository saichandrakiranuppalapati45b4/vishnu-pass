import React, { useState } from 'react';
import { Search, Bell, Users, Shield, UserPlus, BarChart2, Settings, LogOut, Plus } from 'lucide-react';
import DashboardContent from './DashboardContent';
import StudentManagement from './StudentManagement';
import GuardManagement from './GuardManagement';
import Reports from './Reports';

const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'grid' },
    { key: 'students', label: 'Student Management', icon: 'users' },
    { key: 'guards', label: 'Guard Management', icon: 'shield' },
    { key: 'reports', label: 'Reports', icon: 'bar-chart' },
    { key: 'admin', label: 'Admin Management', icon: 'users' },
    { key: 'settings', label: 'Settings', icon: 'settings' },
];

const NavIcon = ({ type, className }) => {
    switch (type) {
        case 'grid':
            return (
                <div className={`grid grid-cols-2 gap-0.5 w-[18px] h-[18px] ${className}`}>
                    <div className="bg-current rounded-[2px]" />
                    <div className="bg-current rounded-[2px]" />
                    <div className="bg-current rounded-[2px]" />
                    <div className="bg-current rounded-[2px] opacity-40" />
                </div>
            );
        case 'users': return <Users className={`w-[18px] h-[18px] ${className}`} />;
        case 'shield': return <Shield className={`w-[18px] h-[18px] ${className}`} />;
        case 'user-plus': return <UserPlus className={`w-[18px] h-[18px] ${className}`} />;
        case 'bar-chart': return <BarChart2 className={`w-[18px] h-[18px] ${className}`} />;
        case 'settings': return <Settings className={`w-[18px] h-[18px] ${className}`} />;
        default: return null;
    }
};

const Dashboard = ({ onLogout }) => {
    const [activePage, setActivePage] = useState('dashboard');

    const renderContent = () => {
        switch (activePage) {
            case 'students':
                return <StudentManagement />;
            case 'guards':
                return <GuardManagement />;
            case 'reports':
                return <Reports />;
            case 'dashboard':
            default:
                return <DashboardContent />;
        }
    };

    return (
        <div className="flex h-screen bg-[#f8f9fb] font-sans">
            {/* Sidebar */}
            <aside className="w-[240px] bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
                {/* Logo */}
                <div className="p-5 flex items-center gap-3 border-b border-gray-100">
                    <div className="w-10 h-10 bg-[#f47c20] rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
                            <defs><path id="c" d="M 50 15 L 75 28 L 65 44 L 50 35 L 35 44 L 25 28 Z" /></defs>
                            <use href="#c" fill="white" />
                            <use href="#c" fill="white" opacity="0.7" transform="rotate(120 50 50)" />
                            <use href="#c" fill="white" opacity="0.7" transform="rotate(240 50 50)" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-[15px] text-gray-900 leading-tight">Vishnu Pass</h2>
                        <p className="text-[11px] text-gray-400 font-medium">Admin Portal</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => setActivePage(item.key)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] transition-colors text-left ${activePage === item.key
                                ? 'bg-[#fff4eb] text-[#f47c20] font-semibold'
                                : 'text-gray-500 hover:bg-gray-50 font-medium'
                                }`}
                        >
                            <NavIcon type={item.icon} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* User Info */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-300">
                            <div className="w-full h-full bg-[#e8d5c4] flex items-end justify-center">
                                <div className="w-5 h-5 bg-[#5a3e2b] rounded-t-full" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">Admin User</p>
                            <p className="text-[11px] text-gray-400 font-medium truncate">admin@vishnu.edu</p>
                        </div>
                        <button onClick={onLogout} title="Logout" className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="h-16 px-8 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-10">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search for students, passes or logs..."
                            className="pl-10 pr-4 py-2.5 bg-[#f4f6f8] border border-gray-100 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#f47c20]/20 transition-all font-medium placeholder:text-gray-400"
                        />
                    </div>
                    <div className="flex items-center gap-3 ml-6">
                        <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <button className="flex items-center gap-2 bg-[#f47c20] hover:bg-[#e06d1c] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm">
                            <Plus className="w-4 h-4" />
                            New Entry
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                {renderContent()}
            </main>
        </div>
    );
};

export default Dashboard;
