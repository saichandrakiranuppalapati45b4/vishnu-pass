import React, { useState } from 'react';
import { ChevronLeft, Search, SlidersHorizontal, CheckCircle2, Ban, Scan, Clock, User } from 'lucide-react';

const GuardRoster = ({ onScannerOpen, onBack }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Expected');

    const expectedStudents = [
        { id: '1', name: 'Arjun Sharma', studentId: 'VP-2024-0892', grad: 'Gr. 11-B', status: 'Pre-Authorized', type: 'success' },
        { id: '2', name: 'Priya Patel', studentId: 'VP-2024-1104', grad: 'Gr. 10-A', status: 'Returning Late', type: 'warning' },
        { id: '3', name: 'Rohan Das', studentId: 'VP-2024-0721', grad: 'Gr. 12-C', status: 'Guest Visit', type: 'info' },
        { id: '4', name: 'Sneha Kapoor', studentId: 'VP-2024-0442', grad: 'Gr. 9-D', status: 'Restricted Entry', type: 'danger' },
    ];

    const visitors = [
        { id: 'v1', name: 'Delivery: Amazon', ref: 'AMZ-9882', vehicle: 'MH-...' },
    ];

    const getStatusStyles = (type) => {
        switch (type) {
            case 'success': return 'bg-emerald-50 text-emerald-600';
            case 'warning': return 'bg-orange-50 text-orange-600';
            case 'info': return 'bg-blue-50 text-blue-600';
            case 'danger': return 'bg-rose-50 text-rose-600 border border-rose-100/50';
            default: return 'bg-gray-50 text-gray-600';
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-[#fdfdfd] min-h-screen relative font-sans">
            {/* Header */}
            <header className="px-6 py-6 flex items-center justify-between bg-white border-b border-gray-50 sticky top-0 z-40">
                <button onClick={onBack} className="w-10 h-10 flex items-center justify-center text-gray-800">
                    <ChevronLeft className="w-7 h-7" />
                </button>
                <h2 className="text-xl font-black text-gray-800 tracking-tight">Main Gate Roster</h2>
                <button className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-[#f47c20]">
                    <SlidersHorizontal className="w-5 h-5" />
                </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 pb-32">
                {/* Search Bar */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#f47c20] transition-colors">
                        <Search className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search student name or ID"
                        className="w-full bg-[#f1f3f5] border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-[#f47c20]/20 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filter Chips */}
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {['All Expected', 'Authorized', 'Flagged'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-6 py-3 rounded-2xl text-[13px] font-black whitespace-nowrap transition-all flex items-center gap-2 ${activeFilter === filter
                                    ? 'bg-[#f47c20] text-white shadow-lg shadow-orange-500/20'
                                    : 'bg-[#e9ecef] text-gray-500'
                                }`}
                        >
                            {filter}
                            {filter !== 'Flagged' && (
                                <ChevronLeft className={`w-4 h-4 rotate-[-90deg] opacity-50 ${activeFilter === filter ? 'text-white' : 'text-gray-400'}`} />
                            )}
                        </button>
                    ))}
                </div>

                {/* Currently Expected Section */}
                <div>
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-[13px] font-black text-gray-900 tracking-[0.1em] uppercase">Currently Expected (12)</h3>
                        <span className="text-[11px] font-bold text-orange-400">Updated 1m ago</span>
                    </div>

                    <div className="space-y-4">
                        {expectedStudents.map((student) => (
                            <div
                                key={student.id}
                                className={`bg-white rounded-[32px] p-5 shadow-sm border ${student.type === 'danger' ? 'bg-[#fff5f5] border-rose-100' : 'border-gray-50'} flex items-center justify-between group active:scale-[0.98] transition-all`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full border-[3px] border-emerald-500 overflow-hidden bg-emerald-50 flex items-center justify-center p-0.5">
                                            <div className="w-full h-full rounded-full overflow-hidden bg-white">
                                                <User className="w-full h-full p-3 text-emerald-200" />
                                            </div>
                                        </div>
                                        <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-[3px] border-white flex items-center justify-center ${student.type === 'danger' ? 'bg-rose-500' : 'bg-emerald-500'
                                            }`}>
                                            {student.type === 'danger' ? <span className="text-[8px] text-white font-bold">!</span> : <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-gray-800 leading-none mb-1.5 tracking-tight group-hover:text-[#f47c20] transition-colors">{student.name}</h4>
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter mb-2">
                                            ID: {studentIdExtract(student.studentId)} • {student.grad}
                                        </p>
                                        <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider ${getStatusStyles(student.type)}`}>
                                            {student.status}
                                        </span>
                                    </div>
                                </div>
                                <button className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${student.type === 'danger'
                                        ? 'bg-[#e9ecef] text-gray-400 shadow-none'
                                        : 'bg-[#f47c20] text-white shadow-orange-500/20 active:scale-95'
                                    }`}>
                                    {student.type === 'danger' ? <Ban className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6 border-white/20" />}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Authorized Visitors Section */}
                <div>
                    <h3 className="text-[13px] font-black text-gray-900 tracking-[0.1em] uppercase mb-5">Authorized Visitors (3)</h3>
                    <div className="space-y-4">
                        {visitors.map((visitor) => (
                            <div key={visitor.id} className="bg-white rounded-[32px] p-5 border border-gray-50 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-[#f47c20]">
                                        <User className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-gray-800 leading-none mb-1.5 tracking-tight">{visitor.name}</h4>
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                                            Ref: {visitor.ref} • Vehicle: {visitor.vehicle}
                                        </p>
                                    </div>
                                </div>
                                <button className="bg-[#f47c20] text-white px-8 py-3 rounded-2xl font-black text-base shadow-lg shadow-orange-500/20 active:scale-95 transition-all">
                                    Verify
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating QR FAB */}
            <button
                onClick={onScannerOpen}
                className="fixed bottom-24 right-6 w-16 h-16 bg-[#f47c20] rounded-3xl shadow-2xl shadow-orange-500/40 flex items-center justify-center text-white active:scale-90 transition-all group overflow-hidden z-[60]"
            >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Scan className="w-8 h-8 relative z-10" />
            </button>
        </div>
    );
};

const studentIdExtract = (id) => id;

export default GuardRoster;
