import React, { useState } from 'react';
import { UserCheck, Clock, ShieldAlert, CheckCircle2, XCircle, Save, RotateCcw, Search, Filter, AlertCircle } from 'lucide-react';

const StudentPermissions = () => {
    const [saving, setSaving] = useState(false);
    
    // Mock settings for student groups
    const [settings, setSettings] = useState({
        dayscholars: {
            autoApproveOutpass: true,
            allowLateEntry: false,
            nightPassEnabled: false,
            maxOutingsPerWeek: 14
        },
        hostellers: {
            autoApproveOutpass: false,
            allowLateEntry: true,
            nightPassEnabled: true,
            maxOutingsPerWeek: 4
        }
    });

    const handleToggle = (group, key) => {
        setSettings(prev => ({
            ...prev,
            [group]: {
                ...prev[group],
                [key]: !prev[group][key]
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSaving(false);
    };

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-[#f8f9fb]">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-[26px] font-bold text-gray-900 mb-1 italic">Student Permissions</h1>
                    <p className="text-sm text-gray-500 font-medium text-left">Configure gate pass policies and attendance rules for student categories.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-gray-600 shadow-sm transition-all active:rotate-180 duration-500">
                        <RotateCcw className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#f47c20] text-white font-black rounded-xl text-xs shadow-lg shadow-orange-500/20 hover:bg-[#e06d1c] transition-all active:scale-95"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {saving ? 'SAVING...' : 'SAVE POLICIES'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                {/* Group Policy Cards */}
                {Object.entries(settings).map(([group, groupSettings]) => (
                    <div key={group} className="bg-white rounded-[32px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                group === 'dayscholars' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                            }`}>
                                <UserCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-[#1a2b3c] capitalize">{group}</h3>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Category Policy</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                                <div>
                                    <p className="font-bold text-[#1a2b3c] text-sm">Auto-Approve Outpass</p>
                                    <p className="text-[11px] text-gray-400 font-medium leading-tight">Skip manual approval for gate exit</p>
                                </div>
                                <button
                                    onClick={() => handleToggle(group, 'autoApproveOutpass')}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors ${groupSettings.autoApproveOutpass ? 'bg-emerald-500' : 'bg-gray-200'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${groupSettings.autoApproveOutpass ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                                <div>
                                    <p className="font-bold text-[#1a2b3c] text-sm">Late Entry Permission</p>
                                    <p className="text-[11px] text-gray-400 font-medium leading-tight">Allow entry after standard hours</p>
                                </div>
                                <button
                                    onClick={() => handleToggle(group, 'allowLateEntry')}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors ${groupSettings.allowLateEntry ? 'bg-orange-500' : 'bg-gray-200'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${groupSettings.allowLateEntry ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                                <div>
                                    <p className="font-bold text-[#1a2b3c] text-sm">Night Pass Access</p>
                                    <p className="text-[11px] text-gray-400 font-medium leading-tight">Enable overnight stay permissions</p>
                                </div>
                                <button
                                    onClick={() => handleToggle(group, 'nightPassEnabled')}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors ${groupSettings.nightPassEnabled ? 'bg-indigo-500' : 'bg-gray-200'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${groupSettings.nightPassEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                                <p className="font-bold text-[#1a2b3c] text-sm mb-3">Weekly Outing Limit</p>
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="21" 
                                        className="flex-1 accent-[#f47c20]"
                                        value={groupSettings.maxOutingsPerWeek}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setSettings(prev => ({
                                                ...prev,
                                                [group]: { ...prev[group], maxOutingsPerWeek: val }
                                            }));
                                        }}
                                    />
                                    <span className="w-12 text-center font-black text-[#f47c20] bg-white border border-gray-100 py-1 rounded-lg text-xs shadow-sm">
                                        {groupSettings.maxOutingsPerWeek}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Individual Exceptions Placeholder */}
                <div className="col-span-2 bg-white rounded-[32px] border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-[#1a2b3c]">Individual Override List</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Special Permissions & Restrictions</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input 
                                    type="text" 
                                    placeholder="Search student ID..." 
                                    className="pl-9 pr-4 py-2 bg-[#f8fafc] border border-gray-100 rounded-xl text-xs font-bold w-64 focus:outline-none focus:ring-2 focus:ring-[#f47c20]/10"
                                />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#f8fafc] border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-wider text-gray-400">
                                <Filter className="w-3 h-3" /> Filter
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-100 rounded-[24px] bg-gray-50/30">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                            <ShieldAlert className="w-8 h-8 text-gray-200" />
                        </div>
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">No Active Exceptions</h4>
                        <p className="text-xs text-gray-400 font-medium mt-1">Search and select a student above to add a unique permission override.</p>
                    </div>
                </div>
            </div>

            {/* Note */}
            <div className="mt-8 flex items-start gap-4 p-6 bg-amber-50 rounded-2xl border border-amber-100/50">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                    <b>Attention:</b> Policy changes applied here will impact the verification status for all security gates. Ensure you have coordinated with the security department before modifying standard outing limits or auto-approval rules.
                </p>
            </div>
        </div>
    );
};

export default StudentPermissions;
