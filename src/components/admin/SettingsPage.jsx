import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Palette, User, Upload, ChevronDown, Building2, Plus, X, Shield, Loader2, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { logAuditAction } from '../../utils/auditLogger';
import { useNotification } from '../../contexts/NotificationContext';

// Custom Time Picker Component to seamlessly match brand colors
const CustomTimePicker = ({ value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Parse current value or use defaults
    let currentH = '06', currentM = '00', currentP = 'AM';
    if (value) {
        const parts = value.match(/(\d+):(\d+)\s(AM|PM)/);
        if (parts) {
            currentH = parts[1]; currentM = parts[2]; currentP = parts[3];
        }
    }

    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
    const periods = ['AM', 'PM'];

    const handleSelect = (type, val) => {
        let newH = currentH, newM = currentM, newP = currentP;
        if (type === 'h') newH = val;
        if (type === 'm') newM = val;
        if (type === 'p') newP = val;
        onChange(`${newH}:${newM} ${newP}`);
    };

    const handleOpen = () => {
        if (!value) onChange(`${currentH}:${currentM} ${currentP}`);
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative w-full">
            <div
                onClick={handleOpen}
                className={`w-full bg-transparent border-none py-1.5 focus:ring-0 text-[13px] font-semibold cursor-pointer outline-none flex justify-center items-center text-center rounded transition-colors ${value ? 'text-gray-900 hover:bg-gray-50' : 'text-gray-400 hover:bg-gray-50'}`}
            >
                {value || placeholder}
            </div>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] z-50 p-2 flex gap-1 h-56 animate-in fade-in zoom-in-95 duration-100 origin-top">
                        {/* Hours */}
                        <div className="overflow-y-auto w-12 border-r border-gray-100 flex flex-col gap-1 pr-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {hours.map(h => (
                                <button
                                    key={`h-${h}`}
                                    type="button"
                                    onClick={() => handleSelect('h', h)}
                                    className={`py-1.5 rounded-lg text-xs font-bold w-full text-center transition-all flex-shrink-0 ${currentH === h ? 'bg-[#f47c20] text-white shadow-sm scale-105' : 'text-gray-500 hover:bg-orange-50 hover:text-[#f47c20]'}`}
                                >
                                    {h}
                                </button>
                            ))}
                        </div>
                        {/* Minutes */}
                        <div className="overflow-y-auto w-12 border-r border-gray-100 flex flex-col gap-1 pr-1 pl-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {minutes.map(m => (
                                <button
                                    key={`m-${m}`}
                                    type="button"
                                    onClick={() => handleSelect('m', m)}
                                    className={`py-1.5 rounded-lg text-xs font-bold w-full text-center transition-all flex-shrink-0 ${currentM === m ? 'bg-[#f47c20] text-white shadow-sm scale-105' : 'text-gray-500 hover:bg-orange-50 hover:text-[#f47c20]'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                        {/* AM/PM */}
                        <div className="w-12 flex flex-col gap-1 pl-1">
                            {periods.map(p => (
                                <button
                                    key={`p-${p}`}
                                    type="button"
                                    onClick={() => handleSelect('p', p)}
                                    className={`py-2 rounded-lg text-xs font-bold w-full text-center transition-all flex-shrink-0 ${currentP === p ? 'bg-[#f47c20] text-white shadow-sm scale-105' : 'text-gray-500 hover:bg-orange-50 hover:text-[#f47c20]'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const SettingsPage = ({ onNavigate, branding, onBrandingUpdate }) => {
    const logoInputRef = React.useRef(null);
    const loginBgInputRef = React.useRef(null);
    const { showNotification, showModal } = useNotification();

    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        maintenance: true,
        security: false,
    });

    const [departments, setDepartments] = useState([]);
    const [newDept, setNewDept] = useState('');
    const [deptToRemove, setDeptToRemove] = useState(null);

    // Guard Management State
    const [gates, setGates] = useState([]);
    const [newGate, setNewGate] = useState('');
    const [gateToRemove, setGateToRemove] = useState(null);

    const [shifts, setShifts] = useState([]);
    const [newShiftName, setNewShiftName] = useState('');
    const [newShiftStartTime, setNewShiftStartTime] = useState('');
    const [newShiftEndTime, setNewShiftEndTime] = useState('');
    const [shiftToRemove, setShiftToRemove] = useState(null);
    const [userEmail, setUserEmail] = useState('admin@vishnupass.com');
    const [adminName, setAdminName] = useState(branding.adminName || 'Admin User');
    const [timezone, setTimezone] = useState('Indian Standard Time (IST) - UTC+5:30');
    const [language, setLanguage] = useState('English (United States)');
    const [isSavingGeneral, setIsSavingGeneral] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

    // Fetch departments and user email from Supabase on mount
    useEffect(() => {
        const fetchData = async () => {
            // Fetch departments
            const { data: deptData, error: deptError } = await supabase
                .from('departments')
                .select('*')
                .order('created_at', { ascending: true });
            if (!deptError && deptData) {
                setDepartments(deptData);
            }

            // Fetch Gates
            const { data: gateData, error: gateError } = await supabase
                .from('guard_gates')
                .select('*')
                .order('created_at', { ascending: true });
            if (!gateError && gateData) {
                setGates(gateData);
            }

            // Fetch Shifts
            const { data: shiftData, error: shiftError } = await supabase
                .from('guard_shifts')
                .select('*')
                .order('created_at', { ascending: true });
            if (!shiftError && shiftData) {
                setShifts(shiftData);
            }

            // Fetch user info
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email);
            }
        };
        fetchData();
    }, []);

    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e, key) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);

            // 1. Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${key}_${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('branding')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('branding')
                .getPublicUrl(filePath);

            // 3. Save to database
            const { error: dbError } = await supabase
                .from('portal_settings')
                .upsert({ key: key, value: publicUrl }, { onConflict: 'key' });

            if (dbError) throw dbError;

            // 4. Update Global State
            onBrandingUpdate(key, publicUrl);

            // 5. Log the action
            await logAuditAction({
                action: 'Updated Branding',
                resource: key,
                details: { url: publicUrl }
            });

        } catch (err) {
            console.error('Error uploading branding asset:', err);
            showNotification('Failed to upload image. Please try again.', 'error');
        } finally {
            setUploading(false);
        }
    };

    const toggleNotification = (key) => {
        setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const addDepartment = async () => {
        const name = newDept.trim();
        if (!name || departments.some((d) => d.name === name)) return;

        const { data, error } = await supabase
            .from('departments')
            .insert({ name })
            .select()
            .single();

        if (!error && data) {
            setDepartments([...departments, data]);
            setNewDept('');

            // Log the action
            await logAuditAction({
                action: 'Added Department',
                resource: name
            });
        }
    };

    const removeDepartment = (dept) => {
        setDeptToRemove(dept);
    };

    const confirmRemove = async () => {
        const { error } = await supabase
            .from('departments')
            .delete()
            .eq('id', deptToRemove.id);

        if (!error) {
            // Log the action before clearing state
            await logAuditAction({
                action: 'Removed Department',
                resource: deptToRemove.name
            });
            setDepartments(departments.filter((d) => d.id !== deptToRemove.id));
        }
        setDeptToRemove(null);
    };

    const addGate = async () => {
        const name = newGate.trim();
        if (!name || gates.some((g) => g.name === name)) return;

        const { data, error } = await supabase
            .from('guard_gates')
            .insert({ name })
            .select()
            .single();

        if (!error && data) {
            setGates([...gates, data]);
            setNewGate('');

            // Log the action
            await logAuditAction({
                action: 'Added Gate',
                resource: name
            });
        }
    };

    const confirmRemoveGate = async () => {
        const { error } = await supabase
            .from('guard_gates')
            .delete()
            .eq('id', gateToRemove.id);

        if (!error) {
            // Log the action
            await logAuditAction({
                action: 'Removed Gate',
                resource: gateToRemove.name
            });
            setGates(gates.filter((g) => g.id !== gateToRemove.id));
        }
        setGateToRemove(null);
    };

    const addShift = async () => {
        const name = newShiftName.trim();
        if (!name || !newShiftStartTime || !newShiftEndTime || shifts.some((s) => s.name === name)) return;
        const time = `${newShiftStartTime} - ${newShiftEndTime}`;

        const { data, error } = await supabase
            .from('guard_shifts')
            .insert({ name, time })
            .select()
            .single();

        if (!error && data) {
            setShifts([...shifts, data]);
            setNewShiftName('');
            setNewShiftStartTime('');
            setNewShiftEndTime('');

            // Log the action
            await logAuditAction({
                action: 'Added Shift',
                resource: name,
                details: { time: time }
            });
        }
    };

    const confirmRemoveShift = async () => {
        const { error } = await supabase
            .from('guard_shifts')
            .delete()
            .eq('id', shiftToRemove.id);

        if (!error) {
            // Log the action
            await logAuditAction({
                action: 'Removed Shift',
                resource: shiftToRemove.name
            });
            setShifts(shifts.filter((s) => s.id !== shiftToRemove.id));
        }
        setShiftToRemove(null);
    };

    const handleSaveGeneral = async () => {
        setIsSavingGeneral(true);
        // Simulate save process
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSavingGeneral(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const handleSaveProfile = async () => {
        if (!adminName.trim()) return;

        try {
            setIsSavingProfile(true);

            // 1. Save to database
            const { error: dbError } = await supabase
                .from('portal_settings')
                .upsert({ key: 'adminName', value: adminName.trim() }, { onConflict: 'key' });

            if (dbError) throw dbError;

            // 2. Update Global State
            onBrandingUpdate('adminName', adminName.trim());

            // 3. Log the action
            await logAuditAction({
                action: 'Updated Profile',
                resource: adminName.trim(),
                details: { email: userEmail }
            });

            setProfileSaveSuccess(true);
            setTimeout(() => setProfileSaveSuccess(false), 3000);
            showNotification('Profile updated successfully.', 'success');
        } catch (err) {
            console.error('Error saving profile:', err);
            showNotification('Failed to save profile name. Please try again.', 'error');
        } finally {
            setIsSavingProfile(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-[#f8f9fb] relative">
            {/* Upload Loading Overlay */}
            {uploading && (
                <div className="absolute inset-0 z-[60] bg-white/60 backdrop-blur-[2px] flex items-center justify-center transition-all duration-300">
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
                        <Loader2 className="w-8 h-8 text-[#f47c20] animate-spin" />
                        <div className="text-center">
                            <p className="font-bold text-gray-900">Synchronizing Branding</p>
                            <p className="text-xs text-gray-400 font-medium">Saving your assets to the security cloud...</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden File Inputs */}
            <input
                type="file"
                ref={logoInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'portalLogo')}
            />
            <input
                type="file"
                ref={loginBgInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'loginBackground')}
            />

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-[26px] font-bold text-gray-900 mb-1 italic">System Settings</h1>
                <p className="text-sm text-gray-500 font-medium">Manage your portal preferences, security credentials, and system integrations.</p>
            </div>

            {/* General Preferences */}
            <div className="mb-8">
                <div className="flex items-center gap-2.5 mb-5">
                    <SettingsIcon className="w-5 h-5 text-[#f47c20]" />
                    <h2 className="font-bold text-gray-900 text-[16px]">General Preferences</h2>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {/* Left: Timezone & Language */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Timezone</label>
                            <div className="relative">
                                <select
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                    className="w-full appearance-none px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#f47c20]/20 focus:border-[#f47c20] pr-10 cursor-pointer"
                                >
                                    <option>Eastern Standard Time (EST) - UTC-5</option>
                                    <option>Indian Standard Time (IST) - UTC+5:30</option>
                                    <option>Pacific Standard Time (PST) - UTC-8</option>
                                </select>
                                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Language</label>
                            <div className="relative">
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full appearance-none px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#f47c20]/20 focus:border-[#f47c20] pr-10 cursor-pointer"
                                >
                                    <option>English (United States)</option>
                                    <option>Hindi</option>
                                    <option>Telugu</option>
                                </select>
                                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>

                        {/* Save Button Container */}
                        <div className="flex justify-end pt-2">
                            <button
                                onClick={handleSaveGeneral}
                                disabled={isSavingGeneral}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm ${saveSuccess
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-[#f47c20] hover:bg-[#e06d1c] text-white'
                                    } disabled:opacity-70 disabled:cursor-not-allowed`}
                            >
                                {isSavingGeneral ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : saveSuccess ? (
                                    <>
                                        <Shield className="w-4 h-4" />
                                        <span>Saved!</span>
                                    </>
                                ) : (
                                    <span>Save Settings</span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right: Notification Toggles */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-5">Notification Toggles</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700 font-medium">Email Alerts for New Passes</span>
                                <button
                                    onClick={() => toggleNotification('emailAlerts')}
                                    className={`w-10 h-6 rounded-full p-0.5 transition-colors ${notifications.emailAlerts ? 'bg-[#f47c20]' : 'bg-gray-200'}`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${notifications.emailAlerts ? 'translate-x-4' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700 font-medium">System Maintenance Updates</span>
                                <button
                                    onClick={() => toggleNotification('maintenance')}
                                    className={`w-10 h-6 rounded-full p-0.5 transition-colors ${notifications.maintenance ? 'bg-emerald-500' : 'bg-gray-200'}`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${notifications.maintenance ? 'translate-x-4' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-700 font-medium">Security Login Notifications</span>
                                <button
                                    onClick={() => toggleNotification('security')}
                                    className={`w-10 h-6 rounded-full p-0.5 transition-colors ${notifications.security ? 'bg-[#8b5cf6]' : 'bg-gray-200'}`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${notifications.security ? 'translate-x-4' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Branding */}
            <div className="mb-8">
                <div className="flex items-center gap-2.5 mb-5">
                    <Palette className="w-5 h-5 text-[#f47c20]" />
                    <h2 className="font-bold text-gray-900 text-[16px]">Branding</h2>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {/* Portal Logo */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Portal Logo</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-[#f47c20] rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden group relative">
                                {branding.portalLogo ? (
                                    <img src={branding.portalLogo} alt="Portal Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
                                        <defs><path id="logo" d="M 50 15 L 75 28 L 65 44 L 50 35 L 35 44 L 25 28 Z" /></defs>
                                        <use href="#logo" fill="white" />
                                        <use href="#logo" fill="white" opacity="0.7" transform="rotate(120 50 50)" />
                                        <use href="#logo" fill="white" opacity="0.7" transform="rotate(240 50 50)" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium mb-2 leading-relaxed">
                                    Update your portal's logo. Recommended size: 200×200px. Supports PNG, JPG or SVG.
                                </p>
                                <button
                                    onClick={() => logoInputRef.current.click()}
                                    className="flex items-center gap-1.5 text-sm font-semibold text-[#f47c20] hover:text-[#d96a18] transition-colors"
                                >
                                    <Upload className="w-3.5 h-3.5" />
                                    Upload New Logo
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Login Screen Image */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Login Screen Image</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                                {branding.loginBackground ? (
                                    <img src={branding.loginBackground} alt="Login Background" className="w-full h-full object-cover" />
                                ) : (
                                    <svg className="w-7 h-7 text-[#f47c20]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="2" y="3" width="20" height="14" rx="2" />
                                        <line x1="8" y1="21" x2="16" y2="21" />
                                        <line x1="12" y1="17" x2="12" y2="21" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium mb-2 leading-relaxed">
                                    Customize the background of your login page. Recommended size: 1920×1080px.
                                </p>
                                <button
                                    onClick={() => loginBgInputRef.current.click()}
                                    className="flex items-center gap-1.5 text-sm font-semibold text-[#f47c20] hover:text-[#d96a18] transition-colors"
                                >
                                    <Upload className="w-3.5 h-3.5" />
                                    Upload New Login Image
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Department Settings */}
            <div className="mb-8">
                <div className="flex items-center gap-2.5 mb-5">
                    <Building2 className="w-5 h-5 text-[#f47c20]" />
                    <h2 className="font-bold text-gray-900 text-[16px]">Department Settings</h2>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                    {/* Add Department */}
                    <div className="flex items-center gap-3 mb-5">
                        <input
                            type="text"
                            value={newDept}
                            onChange={(e) => setNewDept(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addDepartment()}
                            placeholder="Enter department name..."
                            className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#f47c20]/20 focus:border-[#f47c20] placeholder:text-gray-400"
                        />
                        <button
                            onClick={addDepartment}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#f47c20] hover:bg-[#e06d1c] text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Department
                        </button>
                    </div>

                    {/* Department List */}
                    <div className="space-y-2">
                        {departments.map((dept) => (
                            <div key={dept.id} className="flex items-center justify-between px-4 py-3 bg-[#f8f9fb] rounded-xl group hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-[#f47c20]"></div>
                                    <span className="text-sm font-medium text-gray-700">{dept.name}</span>
                                </div>
                                <button
                                    onClick={() => removeDepartment(dept)}
                                    className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Remove department"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <p className="text-xs text-gray-400 font-medium mt-4">{departments.length} departments configured</p>
                </div>
            </div>

            {/* Guard Management Settings */}
            <div className="mb-8">
                <div className="flex items-center gap-2.5 mb-5">
                    <ShieldCheck className="w-5 h-5 text-[#f47c20]" />
                    <h2 className="font-bold text-gray-900 text-[16px]">Guard Management</h2>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {/* Gate Settings */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Gate Locations</h3>

                        {/* Add Gate */}
                        <div className="flex items-center gap-3 mb-5">
                            <input
                                type="text"
                                value={newGate}
                                onChange={(e) => setNewGate(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addGate()}
                                placeholder="Enter gate name..."
                                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#f47c20]/20 focus:border-[#f47c20] placeholder:text-gray-400"
                            />
                            <button
                                onClick={addGate}
                                className="flex justify-center items-center px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm transition-colors border border-gray-200"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Gate List */}
                        <div className="space-y-2">
                            {gates.map((gate) => (
                                <div key={gate.id} className="flex items-center justify-between px-4 py-3 bg-[#f8f9fb] rounded-xl group hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-[#f47c20]"></div>
                                        <span className="text-sm font-medium text-gray-700">{gate.name}</span>
                                    </div>
                                    <button
                                        onClick={() => setGateToRemove(gate)}
                                        className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Remove gate"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shift Settings */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 flex flex-col h-full">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Shift Types</h3>

                        {/* Add Shift */}
                        <div className="flex items-center gap-2 mb-5">
                            <input
                                type="text"
                                value={newShiftName}
                                onChange={(e) => setNewShiftName(e.target.value)}
                                placeholder="Name (e.g. Morning)"
                                className="w-[35%] px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#f47c20]/20 focus:border-[#f47c20] placeholder:text-gray-400"
                            />

                            {/* Custom Time Range Selector */}
                            <div className="flex-1 flex items-center justify-between gap-1 px-2.5 py-1 bg-white border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-[#f47c20]/20 focus-within:border-[#f47c20] transition-colors relative z-20">
                                <CustomTimePicker
                                    value={newShiftStartTime}
                                    onChange={setNewShiftStartTime}
                                    placeholder="Start Time"
                                />
                                <span className="text-gray-300 text-[10px] font-bold uppercase mx-1">to</span>
                                <CustomTimePicker
                                    value={newShiftEndTime}
                                    onChange={setNewShiftEndTime}
                                    placeholder="End Time"
                                />
                            </div>

                            <button
                                onClick={addShift}
                                className="flex justify-center items-center px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm transition-colors border border-gray-200 flex-shrink-0"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Shift List */}
                        <div className="space-y-2 flex-grow">
                            {shifts.map((shift) => (
                                <div key={shift.id} className="flex items-center justify-between px-4 py-3 bg-[#f8f9fb] rounded-xl group hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-[#f47c20]"></div>
                                        <div>
                                            <span className="text-sm font-bold text-gray-900 block leading-tight">{shift.name}</span>
                                            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">{shift.time}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShiftToRemove(shift)}
                                        className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Remove shift"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Account */}
            <div>
                <div className="flex items-center gap-2.5 mb-5">
                    <User className="w-5 h-5 text-[#f47c20]" />
                    <h2 className="font-bold text-gray-900 text-[16px]">Admin Account</h2>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                    <div className="grid grid-cols-3 gap-5 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                            <input
                                type="text"
                                value={adminName}
                                onChange={(e) => setAdminName(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#f47c20]/20 focus:border-[#f47c20]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                            <input
                                type="email"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#f47c20]/20 focus:border-[#f47c20]"
                            />
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-50">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                                <Shield className="w-4 h-4 text-[#f47c20]" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-900 uppercase tracking-tight">Security</p>
                                <p className="text-[11px] text-gray-400 font-medium">Update your account password</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSaveProfile}
                                disabled={isSavingProfile || !adminName.trim()}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm flex items-center gap-2 ${profileSaveSuccess
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                    } disabled:opacity-50`}
                            >
                                {isSavingProfile ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Saving Profile...</span>
                                    </>
                                ) : profileSaveSuccess ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Profile Saved!</span>
                                    </>
                                ) : (
                                    <span>Save Profile</span>
                                )}
                            </button>
                            <button
                                onClick={() => onNavigate('change-password')}
                                className="px-6 py-2.5 bg-[#f47c20] hover:bg-[#e06d1c] text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
                            >
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {deptToRemove && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setDeptToRemove(null)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4 mx-auto">
                            <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Remove Department?</h3>
                        <p className="text-sm text-gray-500 text-center mb-6 font-medium">
                            Are you sure you want to remove <span className="font-bold text-gray-700">"{deptToRemove.name}"</span>? This action cannot be undone.
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setDeptToRemove(null)}
                                className="flex-1 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRemove}
                                className="flex-1 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
                            >
                                Yes, Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Gate Confirmation Modal */}
            {gateToRemove && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setGateToRemove(null)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4 mx-auto">
                            <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Remove Gate?</h3>
                        <p className="text-sm text-gray-500 text-center mb-6 font-medium">
                            Are you sure you want to remove <span className="font-bold text-gray-700">"{gateToRemove.name}"</span>?
                        </p>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setGateToRemove(null)} className="flex-1 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={confirmRemoveGate} className="flex-1 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm">
                                Yes, Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Shift Confirmation Modal */}
            {shiftToRemove && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShiftToRemove(null)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4 mx-auto">
                            <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Remove Shift?</h3>
                        <p className="text-sm text-gray-500 text-center mb-6 font-medium">
                            Are you sure you want to remove <span className="font-bold text-gray-700">"{shiftToRemove.name}"</span>?
                        </p>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setShiftToRemove(null)} className="flex-1 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={confirmRemoveShift} className="flex-1 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm">
                                Yes, Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
