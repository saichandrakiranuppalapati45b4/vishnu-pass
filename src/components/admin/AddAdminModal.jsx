import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { logAuditAction } from '../../utils/auditLogger';
import { Loader2 } from 'lucide-react';

const AddAdminModal = ({ onClose }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const roles = ["Super Admin", "Manager", "Editor"];
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        role: '',
        password: '',
        confirmPassword: '',
        permissions: {
            manageStudents: false,
            approvePasses: false,
            securityGuards: false,
            auditLogs: false,
        }
    });

    const handlePermissionChange = (field) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [field]: !prev.permissions[field]
            }
        }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Create User in Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        role: formData.role
                    }
                }
            });

            if (authError) throw authError;

            // 2. Insert into admins table
            const { error: dbError } = await supabase
                .from('admins')
                .insert({
                    id: authData.user.id,
                    email: formData.email,
                    name: formData.fullName,
                    role: formData.role
                });

            if (dbError) throw dbError;

            // 3. Log the action
            await logAuditAction({
                action: 'Invited Admin',
                resource: formData.email,
                details: {
                    name: formData.fullName,
                    role: formData.role,
                    permissions: formData.permissions
                }
            });

            onClose();
        } catch (err) {
            console.error("Error creating admin:", err);
            setError(err.message || "Failed to create admin account");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4 sm:p-6 lg:p-8">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Add New Admin</h2>
                    <p className="text-sm text-gray-500 font-medium">Configure access and credentials for a new system administrator.</p>
                </div>

                <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                    <form onSubmit={handleCreate}>
                        {error && (
                            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                <AlertTriangle className="w-5 h-5 text-rose-500" />
                                <p className="text-sm font-bold text-rose-600">{error}</p>
                            </div>
                        )}
                        {/* Name and Email */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Rahul Sharma"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f47c20]/20 focus:border-[#f47c20] text-sm font-medium transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="rahul.s@vishnupass.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f47c20]/20 focus:border-[#f47c20] text-sm font-medium transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        {/* Role Designation */}
                        <div className="mb-8 relative z-10">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Role Designation</label>

                            <div className="relative">
                                {/* Invisible overlay to close dropdown */}
                                {isDropdownOpen && (
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsDropdownOpen(false)}
                                    />
                                )}

                                {/* Dropdown trigger */}
                                <div
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg flex items-center justify-between cursor-pointer transition-colors relative z-20 ${isDropdownOpen
                                        ? 'border-[#f47c20] ring-2 ring-[#f47c20]/20'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <span className={`text-sm font-medium ${formData.role ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {formData.role || 'Select an admin role'}
                                    </span>
                                    <svg
                                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                        className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                    >
                                        <path d="m6 9 6 6 6-6" />
                                    </svg>
                                </div>

                                {/* Dropdown menu */}
                                {isDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                                        <div className="py-1">
                                            {roles.map(role => (
                                                <button
                                                    key={role}
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData({ ...formData, role });
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-between group"
                                                >
                                                    <span className={`${formData.role === role ? 'text-[#f47c20] font-bold' : 'text-gray-700 group-hover:text-gray-900'}`}>
                                                        {role}
                                                    </span>
                                                    {formData.role === role && (
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#f47c20]">
                                                            <path d="M20 6 9 17l-5-5" />
                                                        </svg>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Access Permissions */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Access Permissions</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Manage Students */}
                                <label className="flex items-start gap-4 p-5 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors cursor-pointer bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                    <div className="flex items-center h-5 mt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={formData.permissions.manageStudents}
                                            onChange={() => handlePermissionChange('manageStudents')}
                                            className="w-[18px] h-[18px] text-[#0f172a] bg-white border-gray-300 rounded focus:ring-[#0f172a]/20 focus:ring-2 cursor-pointer transition-all"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#0f172a] mb-1">Manage Students</p>
                                        <p className="text-xs text-gray-500 font-medium">Add, edit, or remove student records</p>
                                    </div>
                                </label>

                                {/* Approve Passes */}
                                <label className="flex items-start gap-4 p-5 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors cursor-pointer bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                    <div className="flex items-center h-5 mt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={formData.permissions.approvePasses}
                                            onChange={() => handlePermissionChange('approvePasses')}
                                            className="w-[18px] h-[18px] text-[#0f172a] bg-white border-gray-300 rounded focus:ring-[#0f172a]/20 focus:ring-2 cursor-pointer transition-all"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#0f172a] mb-1">Approve Passes</p>
                                        <p className="text-xs text-gray-500 font-medium">Grant or deny exit/entry requests</p>
                                    </div>
                                </label>

                                {/* Security Guards */}
                                <label className="flex items-start gap-4 p-5 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors cursor-pointer bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                    <div className="flex items-center h-5 mt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={formData.permissions.securityGuards}
                                            onChange={() => handlePermissionChange('securityGuards')}
                                            className="w-[18px] h-[18px] text-[#0f172a] bg-white border-gray-300 rounded focus:ring-[#0f172a]/20 focus:ring-2 cursor-pointer transition-all"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#0f172a] mb-1">Security Guards</p>
                                        <p className="text-xs text-gray-500 font-medium">Manage guard shifts and assignments</p>
                                    </div>
                                </label>

                                {/* Audit Logs */}
                                <label className="flex items-start gap-4 p-5 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors cursor-pointer bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                    <div className="flex items-center h-5 mt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={formData.permissions.auditLogs}
                                            onChange={() => handlePermissionChange('auditLogs')}
                                            className="w-[18px] h-[18px] text-[#0f172a] bg-white border-gray-300 rounded focus:ring-[#0f172a]/20 focus:ring-2 cursor-pointer transition-all"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#0f172a] mb-1">Audit Logs</p>
                                        <p className="text-xs text-gray-500 font-medium">Access and export system activity reports</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Password Settings */}
                        <div className="mt-8 border-t border-gray-100 pt-8">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Password Settings</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f47c20]/20 focus:border-[#f47c20] text-sm font-medium transition-colors tracking-widest text-lg"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f47c20]/20 focus:border-[#f47c20] text-sm font-medium transition-colors tracking-widest text-lg"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer Line */}
                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end items-center gap-4 sticky bottom-0 bg-white pb-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2.5 bg-[#f47c20] hover:bg-[#e06d1c] text-white rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Admin Account'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddAdminModal;
