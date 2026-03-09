import React, { useState } from 'react';
import Home from './Home';
import BottomNav from './BottomNav';
import ScanScreen from './ScanScreen';
import { ScanLine, Clock, User, LogOut } from 'lucide-react';

// eslint-disable-next-line no-unused-vars
const PlaceholderView = ({ title, icon: HeroIcon }) => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-400 bg-[#f8f9fb]">
        <div className="w-20 h-20 rounded-[32px] bg-white shadow-sm flex items-center justify-center mb-4">
            <HeroIcon className="w-8 h-8 text-[#f47c20]" />
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-2">{title}</h2>
        <p className="text-sm font-bold text-center">This feature is coming soon to your student portal.</p>
    </div>
);

const StudentDashboard = ({ studentData, onLogout }) => {
    const [activeTab, setActiveTab] = useState('home');

    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return <Home studentData={studentData} />;
            case 'scan':
                return <ScanScreen studentData={studentData} />;
            case 'logs':
                return <PlaceholderView title="Movement Logs" icon={Clock} />;
            case 'profile':
                return (
                    <div className="flex-1 flex flex-col bg-[#f8f9fb]">
                        <PlaceholderView title="My Profile" icon={User} />
                        <div className="p-6 pt-0">
                            <button
                                onClick={onLogout}
                                className="w-full py-4 bg-white border border-red-100 text-red-500 font-black rounded-2xl shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                                SIGN OUT
                            </button>
                        </div>
                    </div>
                );
            default:
                return <Home studentData={studentData} />;
        }
    };

    return (
        <div className="flex flex-col h-screen bg-white max-w-md mx-auto relative shadow-2xl overflow-hidden">
            {/* Main View Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {renderContent()}
            </div>

            {/* Navigation */}
            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
};

export default StudentDashboard;
