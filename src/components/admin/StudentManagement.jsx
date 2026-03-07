import React, { useState } from 'react';
import { Download, Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown, Filter, MoreVertical } from 'lucide-react';

const students = [
    {
        name: 'Rahul Sharma',
        email: 'rahul.s@university.edu',
        id: 'VP-2024-0012',
        department: 'Computer Science & Eng.',
        status: 'Active',
        avatar: '#4f46e5',
    },
    {
        name: 'Ananya Iyer',
        email: 'ananya.i@university.edu',
        id: 'VP-2024-0459',
        department: 'Electronics & Comm.',
        status: 'On Leave',
        avatar: '#e11d48',
    },
    {
        name: 'Vikrant Gupta',
        email: 'vik.g@university.edu',
        id: 'VP-2024-0102',
        department: 'Mechanical Eng.',
        status: 'Active',
        avatar: '#0891b2',
    },
    {
        name: 'Priya Das',
        email: 'priya.d@university.edu',
        id: 'VP-2023-0992',
        department: 'Civil Engineering',
        status: 'Graduated',
        avatar: '#7c3aed',
    },
    {
        name: 'Arjun Reddy',
        email: 'arjun.r@university.edu',
        id: 'VP-2024-1108',
        department: 'Information Technology',
        status: 'Active',
        avatar: '#059669',
    },
];

const statusStyles = {
    Active: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    'On Leave': 'bg-amber-50 text-amber-600 border-amber-200',
    Graduated: 'bg-gray-100 text-gray-500 border-gray-200',
};

const StudentManagement = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    return (
        <div className="flex-1 overflow-y-auto p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-[26px] font-bold text-gray-900 mb-1">Student Directory</h1>
                    <p className="text-sm text-gray-500 font-medium">Manage and monitor 4,281 student records across all campuses.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-[#f47c20] hover:bg-[#e06d1c] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
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
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        All Departments
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <Filter className="w-3.5 h-3.5 text-gray-400" />
                        Active Only
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        Batch 2024
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
                <div className="text-sm text-gray-400 font-medium flex items-center gap-2">
                    Showing 1-10 of 4,281
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
                        {students.map((student, index) => (
                            <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                            style={{ backgroundColor: student.avatar }}
                                        >
                                            {student.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">{student.name}</p>
                                            <p className="text-xs text-gray-400 font-medium">{student.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 font-medium">{student.id}</td>
                                <td className="px-6 py-4 text-gray-600 font-medium">{student.department}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border ${statusStyles[student.status]}`}>
                                        {student.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                        Row per page:
                        <button className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            {rowsPerPage}
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
        </div>
    );
};

export default StudentManagement;
