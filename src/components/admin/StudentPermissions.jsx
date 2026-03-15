import React, { useState, useEffect, useCallback } from 'react';
import { UserCheck, Clock, ShieldAlert, CheckCircle2, XCircle, Save, RotateCcw, Search, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../../contexts/NotificationContext';

const StudentPermissions = () => {
    const [saving, setSaving] = useState(false);
    const [pendingStudents, setPendingStudents] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const { showNotification, showModal } = useNotification();
    
    const initialSettings = {
        dayscholar: {
            autoApproveOutpass: true,
            allowLateEntry: false,
            nightPassEnabled: false,
            monthlyInLimit: 60,
            monthlyOutLimit: 60
        },
        hosteler: {
            autoApproveOutpass: false,
            allowLateEntry: true,
            nightPassEnabled: true,
            monthlyInLimit: 12,
            monthlyOutLimit: 12
        }
    };

    const [settings, setSettings] = useState(initialSettings);

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
        try {
            setSaving(true);
            
            // Explicitly construct the value object to ensure clean data
            const policiesToSave = {
                dayscholar: {
                    autoApproveOutpass: settings.dayscholar.autoApproveOutpass,
                    allowLateEntry: settings.dayscholar.allowLateEntry,
                    nightPassEnabled: settings.dayscholar.nightPassEnabled,
                    monthlyInLimit: settings.dayscholar.monthlyInLimit,
                    monthlyOutLimit: settings.dayscholar.monthlyOutLimit
                },
                hosteler: {
                    autoApproveOutpass: settings.hosteler.autoApproveOutpass,
                    allowLateEntry: settings.hosteler.allowLateEntry,
                    nightPassEnabled: settings.hosteler.nightPassEnabled,
                    monthlyInLimit: settings.hosteler.monthlyInLimit,
                    monthlyOutLimit: settings.hosteler.monthlyOutLimit
                }
            };

            const { error } = await supabase
                .from('portal_settings')
                .upsert({ 
                    key: 'student_policies', 
                    value: policiesToSave
                }, { onConflict: 'key' });

            if (error) throw error;

            showNotification('Student policies updated successfully.', 'success');
        } catch (err) {
            console.error('Error saving policies:', err);
            showNotification(`Failed to save policies: ${err.message}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    // Fetch policies and pending students
    const fetchData = useCallback(async () => {
        setLoadingRequests(true);
        
        try {
            // 1. Fetch Policies
            const { data: policyData, error: fetchError } = await supabase
                .from('portal_settings')
                .select('value')
                .eq('key', 'student_policies')
                .maybeSingle();
            
            if (fetchError) throw fetchError;

            if (policyData) {
                const val = policyData.value;
                if (val && typeof val === 'object') {
                    // Robust normalization: support old plural keys and merge with defaults
                    setSettings({
                        dayscholar: {
                            ...initialSettings.dayscholar,
                            ...(val.dayscholar || val.dayscholars || {})
                        },
                        hosteler: {
                            ...initialSettings.hosteler,
                            ...(val.hosteler || val.hostellers || {})
                        }
                    });
                }
            }
        } catch (err) {
            console.error('Error fetching policies:', err);
            // Don't show error notification on mount, just use defaults
        }

        // 2. Fetch Pending Students
        const { data, error } = await supabase
            .from('students')
            .select('*, departments(name)')
            .in('status', ['Pending', 'Logged Out'])
            .not('login_requested_at', 'is', null)
            .order('login_requested_at', { ascending: false });

        if (!error && data) {
            setPendingStudents(data);
        }
        setLoadingRequests(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleApprove = async (studentId, studentName) => {
        try {
            const { error } = await supabase
                .from('students')
                .update({ status: 'Approved' })
                .eq('id', studentId);

            if (error) throw error;

            setPendingStudents(prev => prev.filter(s => s.id !== studentId));
            showNotification(`${studentName}'s account has been approved.`, 'success');
        } catch (err) {
            console.error(err);
            showNotification('Failed to approve student.', 'error');
        }
    };

    const handleReject = async (studentId, studentName) => {
        const confirmed = await showModal({
            title: 'Reject Request',
            message: `Are you sure you want to reject and delete the request for ${studentName}?`,
            confirmText: 'Reject',
            cancelText: 'Cancel',
            type: 'warning'
        });

        if (!confirmed) return;

        try {
            const { error } = await supabase
                .from('students')
                .delete()
                .eq('id', studentId);

            if (error) throw error;

            setPendingStudents(prev => prev.filter(s => s.id !== studentId));
            showNotification(`${studentName}'s request has been rejected.`, 'success');
        } catch (err) {
            console.error(err);
            showNotification('Failed to reject student.', 'error');
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-[#f8f9fb]">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-[26px] font-bold text-gray-900 mb-1 italic">Student Permissions</h1>
                    <p className="text-sm text-gray-500 font-medium">Manage institutional student permissions and login approval requests.</p>
                </div>
                <div className="flex gap-3">
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
                {['dayscholar', 'hosteler'].map(group => {
                    const groupSettings = settings[group];
                    if (!groupSettings) return null;
                    return (
                        <div key={group} className="bg-white rounded-[32px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                group === 'dayscholar' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
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
                                <p className="font-bold text-[#1a2b3c] text-sm mb-3 text-emerald-600">Monthly In Limit</p>
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        className="flex-1 accent-emerald-500"
                                        value={groupSettings.monthlyInLimit}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setSettings(prev => ({
                                                ...prev,
                                                [group]: { ...prev[group], monthlyInLimit: val }
                                            }));
                                        }}
                                    />
                                    <span className="w-12 text-center font-black text-emerald-600 bg-white border border-gray-100 py-1 rounded-lg text-xs shadow-sm">
                                        {groupSettings.monthlyInLimit}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                                <p className="font-bold text-[#1a2b3c] text-sm mb-3 text-orange-600">Monthly Out Limit</p>
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        className="flex-1 accent-orange-500"
                                        value={groupSettings.monthlyOutLimit}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setSettings(prev => ({
                                                ...prev,
                                                [group]: { ...prev[group], monthlyOutLimit: val }
                                            }));
                                        }}
                                    />
                                    <span className="w-12 text-center font-black text-orange-600 bg-white border border-gray-100 py-1 rounded-lg text-xs shadow-sm">
                                        {groupSettings.monthlyOutLimit}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    );
                })}

                {/* Pending Approval Requests */}
                <div className="col-span-2 bg-white rounded-[32px] border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-[#1a2b3c]">Pending Approval Requests</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Approve or reject student login requests</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={fetchData}
                                className="p-2.5 bg-[#f8fafc] border border-gray-100 rounded-xl text-gray-400 hover:text-[#f47c20] hover:bg-orange-50/50 transition-all active:scale-95 group"
                                title="Refresh Requests"
                            >
                                <RefreshCw className={`w-4 h-4 ${loadingRequests ? 'animate-spin text-[#f47c20]' : ''}`} />
                            </button>
                            <div className="relative">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input 
                                    type="text" 
                                    placeholder="Search student ID..." 
                                    className="pl-9 pr-4 py-2 bg-[#f8fafc] border border-gray-100 rounded-xl text-xs font-bold w-64 focus:outline-none focus:ring-2 focus:ring-[#f47c20]/10"
                                />
                            </div>
                        </div>
                    </div>

                    {loadingRequests ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-8 h-8 border-4 border-[#f47c20] border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fetching requests...</p>
                        </div>
                    ) : pendingStudents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-100 rounded-[24px] bg-gray-50/30">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                                <UserCheck className="w-8 h-8 text-gray-200" />
                            </div>
                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">No Pending Requests</h4>
                            <p className="text-xs text-gray-400 font-medium mt-1">All student accounts are currently processed.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden border border-gray-100 rounded-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Details</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Department & Year</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {pendingStudents.map(student => (
                                        <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center font-bold text-[#f47c20]">
                                                        {student.full_name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-[#1a2b3c]">{student.full_name}</p>
                                                        <p className="text-[11px] text-gray-400 font-bold uppercase">{student.student_id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-bold text-gray-700">{student.departments?.name || 'Unknown'}</p>
                                                <p className="text-[11px] text-gray-400 font-medium">{student.year_of_study} Year</p>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleReject(student.id, student.full_name)}
                                                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                                        title="Reject Request"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleApprove(student.id, student.full_name)}
                                                        className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-colors"
                                                        title="Approve Request"
                                                    >
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
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
