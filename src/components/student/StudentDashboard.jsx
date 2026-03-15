import React, { useState } from 'react';
import Home from './Home';
import BottomNav from './BottomNav';
import ScanScreen from './ScanScreen';
import EntryLogs from './EntryLogs';
import ProfileScreen from './ProfileScreen';
import Notifications from './Notifications';
import { LogOut } from 'lucide-react';

const StudentDashboard = ({ studentData, onLogout }) => {
    const [activeTab, setActiveTab] = useState('home');

    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return <Home studentData={studentData} onNotificationClick={() => setActiveTab('notifications')} />;
            case 'scan':
                return <ScanScreen studentData={studentData} onBack={() => setActiveTab('home')} />;
            case 'logs':
                return <EntryLogs studentData={studentData} />;
            case 'profile':
                return <ProfileScreen studentData={studentData} onLogout={onLogout} />;
            case 'notifications':
                return <Notifications studentData={studentData} onBack={() => setActiveTab('home')} />;
            default:
                return <Home studentData={studentData} onNotificationClick={() => setActiveTab('notifications')} />;
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
