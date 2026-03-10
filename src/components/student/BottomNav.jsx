import React from 'react';
import { LayoutGrid, Scan, ClipboardList, User } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const BottomNav = ({ activeTab, onTabChange }) => {
    const { t } = useLanguage();

    const tabs = [
        { id: 'home', icon: LayoutGrid, label: 'DASHBOARD' },
        { id: 'scan', icon: Scan, label: 'SCANNER' },
        { id: 'logs', icon: ClipboardList, label: 'LOGS' },
        { id: 'profile', icon: User, label: 'PROFILE' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#2b241d] py-3 px-6 flex items-center justify-between z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.3)] border-t border-white/5">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className="flex flex-col items-center gap-1.5 min-w-[64px] relative"
                    >
                        <div className={`w-14 h-9 flex items-center justify-center rounded-2xl transition-all duration-300 ${isActive ? 'bg-[#5c4a3a] text-[#f47c20]' : 'text-white/40'
                            }`}>
                            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                        </div>
                        <span className={`text-[9px] font-black tracking-widest transition-all duration-300 ${isActive ? 'text-[#f47c20] opacity-100' : 'text-white/40 opacity-80'
                            }`}>
                            {tab.label}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
};

export default BottomNav;
