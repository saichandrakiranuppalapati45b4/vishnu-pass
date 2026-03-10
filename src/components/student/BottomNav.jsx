import React from 'react';
import { Home, QrCode, Clock, User } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const BottomNav = ({ activeTab, onTabChange }) => {
    const { t } = useLanguage();

    const tabs = [
        { id: 'home', icon: Home, label: t('nav.home').toUpperCase() },
        { id: 'scan', icon: QrCode, label: t('nav.scan').toUpperCase() },
        { id: 'logs', icon: Clock, label: t('nav.logs').toUpperCase() },
        { id: 'profile', icon: User, label: t('nav.profile').toUpperCase() },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around px-2 py-3 pb-6 z-50">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-[#f47c20] scale-110' : 'text-gray-400'
                            }`}
                    >
                        <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
                        <span className={`text-[10px] font-black tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                            {tab.label}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
};

export default BottomNav;
