import React, { useState, useEffect, useRef } from 'react';
import {
    Plus, Search, Filter, Download, MoreVertical,
    ChevronDown, Trash2, User, ChevronLeft, ChevronRight,
    ChevronsLeft, ChevronsRight, Pencil, Loader2
} from 'lucide-react';

import { supabase } from '../../lib/supabase';
import { logAuditAction } from '../../utils/auditLogger';
import { useNotification } from '../../contexts/NotificationContext';
import EditStudentModal from './EditStudentModal';

// Helper function to generate a consistent color from a name
const stringToColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
};

const statusStyles = {
    Active: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    'On Leave': 'bg-amber-50 text-amber-600 border-amber-200',
    Graduated: 'bg-gray-100 text-gray-500 border-gray-200',
};

const StudentManagement = ({ onNavigate }) => {
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [departments, setDepartments] = useState([]);
    const { showNotification, showModal } = useNotification();

    // Filter State
    const [deptFilter, setDeptFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [batchFilter, setBatchFilter] = useState('all');

    // Dropdown State
    const [openDropdown, setOpenDropdown] = useState(null); // 'dept' | 'batch' | null
    const [actionMenuId, setActionMenuId] = useState(null); // student.id | null
    const [editingStudent, setEditingStudent] = useState(null);
    const dropdownRef = useRef(null);
    const actionMenuRef = useRef(null);

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        fetchStudents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deptFilter, statusFilter, batchFilter]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpenDropdown(null);
            }
            if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
                setActionMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchDepartments = async () => {
        const { data } = await supabase.from('departments').select('*').order('name');
        if (data) setDepartments(data);
    };

    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            let query = supabase
                .from('students')
                .select('*, departments(name)', { count: 'exact' });

            if (deptFilter !== 'all') {
                query = query.eq('department_id', deptFilter);
            }

            if (statusFilter === 'Active Only') {
                query = query.eq('status', 'Active');
            }

            if (batchFilter !== 'all') {
                query = query.eq('batch', batchFilter);
            }

            const { data, error, count } = await query
                .order('created_at', { ascending: false });

            if (error) throw error;
            setStudents(data || []);
            setTotalCount(count || 0);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteStudent = async (studentId, studentName) => {
        const confirmed = await showModal({
            title: 'Delete Student',
            message: `Are you sure you want to delete ${studentName}? This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'warning'
        });

        if (!confirmed) {
            return;
        }

        try {
            const { error } = await supabase
                .from('students')
                .delete()
                .eq('id', studentId);

            if (error) throw error;

            // Log the action
            await logAuditAction({
                action: 'Deleted Student',
                resource: studentName,
                details: { id: studentId }
            });

            // Refresh list
            fetchStudents();
            setActionMenuId(null);
            showNotification(`${studentName} deleted successfully.`, 'success');
        } catch (error) {
            console.error('Error deleting student:', error);
            showNotification('Failed to delete student. Please try again.', 'error');
        }
    };

    const getDeptName = () => {
        if (deptFilter === 'all') return 'All Departments';
        return departments.find(d => d.id === deptFilter)?.name || 'All Departments';
    };

    return (
        <div className="flex-1 overflow-y-auto p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-[26px] font-bold text-gray-900 mb-1">Student Directory</h1>
                    <p className="text-sm text-gray-500 font-medium">Manage and monitor {totalCount.toLocaleString()} student records across all campuses.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                    <button onClick={() => onNavigate('register-student')} className="flex items-center gap-2 px-5 py-2.5 bg-[#f47c20] hover:bg-[#e06d1c] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
                        <Plus className="w-4 h-4" />
                        Add New Student
                    </button>
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="text-sm text-gray-400 font-medium mb-5">
                <span className="text-gray-400">Admin</span>
                <span className="mx-2">/</span>
                <span className="text-gray-700 font-semibold">Students</span>
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between mb-6" ref={dropdownRef}>
                <div className="flex items-center gap-3">
                    {/* Department Filter */}
                    <div className="relative">
                        <button
                            onClick={() => setOpenDropdown(openDropdown === 'dept' ? null : 'dept')}
                            className={`flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-medium transition-colors ${deptFilter !== 'all' ? 'border-[#f47c20] text-[#f47c20]' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                        >
                            {getDeptName()}
                            <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === 'dept' ? 'rotate-180' : ''}`} />
                        </button>

                        {openDropdown === 'dept' && (
                            <div className="absolute z-50 top-full left-0 mt-1.5 w-64 bg-white border border-gray-200 rounded-xl shadow-lg ring-1 ring-black/5 overflow-hidden animate-in fade-in slide-in-from-top-1">
                                <div className="py-1 max-h-60 overflow-y-auto">
                                    <button
                                        onClick={() => { setDeptFilter('all'); setOpenDropdown(null); }}
                                        className={`w-full text-left px-4 py-2 text-sm ${deptFilter === 'all' ? 'bg-orange-50 text-[#f47c20] font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        All Departments
                                    </button>
                                    {departments.map((dept) => (
                                        <button
                                            key={dept.id}
                                            onClick={() => { setDeptFilter(dept.id); setOpenDropdown(null); }}
                                            className={`w-full text-left px-4 py-2 text-sm ${deptFilter === dept.id ? 'bg-orange-50 text-[#f47c20] font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            {dept.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Active Only Filter */}
                    <button
                        onClick={() => setStatusFilter(statusFilter === 'Active' ? 'all' : 'Active')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === 'Active' ? 'bg-[#f47c20] text-white border-[#f47c20]' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                        <Filter className={`w-3.5 h-3.5 ${statusFilter === 'Active' ? 'text-white' : 'text-gray-400'}`} />
                        Active Only
                    </button>

                    {/* Batch Filter */}
                    <div className="relative">
                        <button
                            onClick={() => setOpenDropdown(openDropdown === 'batch' ? null : 'batch')}
                            className={`flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-medium transition-colors ${batchFilter !== 'all' ? 'border-[#f47c20] text-[#f47c20]' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                        >
                            {batchFilter === 'all' ? 'Select Batch' : `Batch ${batchFilter}`}
                            <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === 'batch' ? 'rotate-180' : ''}`} />
                        </button>

                        {openDropdown === 'batch' && (
                            <div className="absolute z-50 top-full left-0 mt-1.5 w-40 bg-white border border-gray-200 rounded-xl shadow-lg ring-1 ring-black/5 overflow-hidden animate-in fade-in slide-in-from-top-1">
                                <div className="py-1">
                                    {['all', '2023', '2024', '2025'].map((batch) => (
                                        <button
                                            key={batch}
                                            onClick={() => { setBatchFilter(batch); setOpenDropdown(null); }}
                                            className={`w-full text-left px-4 py-2 text-sm ${batchFilter === batch ? 'bg-orange-50 text-[#f47c20] font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            {batch === 'all' ? 'All Batches' : `Batch ${batch}`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="text-sm text-gray-400 font-medium flex items-center gap-2">
                    Showing {students.length} of {totalCount}
                    <div className="flex items-center gap-1 ml-2">
                        <button className="p-1 text-gray-300 hover:text-gray-500 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                        <button className="p-1 text-gray-300 hover:text-gray-500 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Student Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Student ID</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Department</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {isLoading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="w-8 h-8 animate-spin text-[#f47c20]" />
                                        <p className="text-sm font-medium">Fetching student directory...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : students.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-400">No student records found.</td>
                            </tr>
                        ) : (
                            students.map((student) => (
                                <tr
                                    key={student.id}
                                    onClick={() => onNavigate('student-profile', student.id)}
                                    className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {student.photo_url ? (
                                                <img src={student.photo_url} alt="" className="w-9 h-9 rounded-full object-cover border border-gray-100" />
                                            ) : (
                                                <div
                                                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                                    style={{ backgroundColor: stringToColor(student.full_name) }}
                                                >
                                                    {student.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">{student.full_name}</p>
                                                <p className="text-xs text-gray-400 font-medium">{student.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 font-medium">{student.student_id}</td>
                                    <td className="px-6 py-4 text-gray-600 font-medium">{student.departments?.name || 'General'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border ${statusStyles[student.status] || statusStyles['Active']}`}>
                                            {student.status || 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="relative inline-block text-left" ref={actionMenuId === student.id ? actionMenuRef : null}>
                                            <button
                                                onClick={() => setActionMenuId(actionMenuId === student.id ? null : student.id)}
                                                className={`p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg ${actionMenuId === student.id ? 'bg-gray-100 text-gray-900' : 'opacity-0 group-hover:opacity-100'}`}
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </button>

                                            {actionMenuId === student.id && (
                                                <div className="absolute z-50 right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95">
                                                    <div className="py-1.5 px-1">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingStudent(student);
                                                                setActionMenuId(null);
                                                            }}
                                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-orange-50 hover:text-[#f47c20] rounded-lg transition-colors"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                            Edit Record
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteStudent(student.id, student.full_name);
                                                                setActionMenuId(null);
                                                            }}
                                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                            Delete Record
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                        Showing {students.length} students per page
                        <button className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            10
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                    </div>
                    <div className="flex items-center gap-1">
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <ChevronsLeft className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center bg-[#f47c20] text-white rounded-lg text-sm font-bold">1</button>
                        <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">2</button>
                        <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">3</button>
                        <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">…</span>
                        <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">429</button>
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <ChevronsRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
            {/* Modals */}
            {editingStudent && (
                <EditStudentModal
                    student={editingStudent}
                    onClose={() => setEditingStudent(null)}
                    onUpdate={fetchStudents}
                />
            )}
        </div>
    );
};

export default StudentManagement;
