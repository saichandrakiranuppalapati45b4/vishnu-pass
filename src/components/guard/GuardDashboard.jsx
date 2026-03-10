import React, { useState } from 'react';
import { Home, History, Users, User, LogOut } from 'lucide-react';
import GuardHome from './Home';
import GuardProfile from './Profile';
import GuardHistory from './GuardHistory';
import SecuritySettings from './SecuritySettings';
import GuardRoster from './Roster';

const GuardDashboard = ({ onLogout, guardData }) => {
    const [activeTab, setActiveTab] = useState('home');

    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return <GuardHome guardData={guardData} />;
            case 'history':
                return <GuardHistory guardData={guardData} onBack={() => setActiveTab('home')} />;
            case 'roster':
                return <GuardRoster onBack={() => setActiveTab('home')} />;
            case 'profile':
                return <GuardProfile guardData={guardData} onLogout={onLogout} onNavigate={(tab) => setActiveTab(tab)} />;
            case 'security':
                return <SecuritySettings onBack={() => setActiveTab('profile')} />;
            default:
                return <GuardHome guardData={guardData} />;
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fb] flex flex-col font-sans">
            {/* Main Content Area */}
            <main className="flex-1 pb-24 overflow-y-auto">
                {renderContent()}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-around items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                <button
                    onClick={() => setActiveTab('home')}
                    className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-[#f47c20]' : 'text-gray-400'}`}
                >
                    <Home className={`w-6 h-6 ${activeTab === 'home' ? 'fill-[#f47c20]/10' : ''}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
                </button>

                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'history' ? 'text-[#f47c20]' : 'text-gray-400'}`}
                >
                    <History className={`w-6 h-6 ${activeTab === 'history' ? 'fill-[#f47c20]/10' : ''}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">History</span>
                </button>



                <button
                    onClick={() => setActiveTab('roster')}
                    className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'roster' ? 'text-[#f47c20]' : 'text-gray-400'}`}
                >
                    <Users className={`w-6 h-6 ${activeTab === 'roster' ? 'fill-[#f47c20]/10' : ''}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Roster</span>
                </button>

                <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? 'text-[#f47c20]' : 'text-gray-400'}`}
                >
                    <User className={`w-6 h-6 ${activeTab === 'profile' ? 'fill-[#f47c20]/10' : ''}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Profile</span>
                </button>
            </nav>
        </div>
    );
};

export default GuardDashboard;
