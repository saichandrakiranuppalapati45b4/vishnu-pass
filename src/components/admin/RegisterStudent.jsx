import React, { useState, useRef, useEffect } from 'react';
import { User, GraduationCap, Camera, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Custom Dropdown Component
const CustomSelect = ({ label, value, options, placeholder = 'Select', onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selected = options.find((o) => o.value === value);

    return (
        <div>
            {label && <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</label>}
            <div className="relative" ref={ref}>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border rounded-xl text-sm font-medium transition-colors cursor-pointer ${isOpen ? 'border-[#f47c20] ring-2 ring-[#f47c20]/20' : 'border-gray-200 hover:border-gray-300'} ${selected ? 'text-gray-700' : 'text-gray-400'}`}
                >
                    <span>{selected ? selected.label : placeholder}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1">
                        <div className="py-1 max-h-52 overflow-y-auto">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${value === option.value ? 'bg-[#f47c20] text-white' : 'text-gray-700 hover:bg-orange-50 hover:text-[#f47c20]'}`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
];

const yearOptions = [
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' },
    { value: '4', label: '4th Year' },
];

const hostelOptions = [
    { value: 'dayscholar', label: 'Dayscholar' },
    { value: 'hosteler', label: 'Hosteler' },
];

const RegisterStudent = ({ onCancel }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        studentId: '',
        gender: '',
        email: '',
        department: '',
        yearOfStudy: '',
        hostel: '',
    });

    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch live departments from Supabase
    useEffect(() => {
        const fetchDepartments = async () => {
            const { data, error } = await supabase
                .from('departments')
                .select('id, name')
                .order('name', { ascending: true });

            if (!error && data) {
                // Map to { value, label } for CustomSelect
                setDepartments(data.map(d => ({ value: d.id, label: d.name })));
            }
            setLoading(false);
        };
        fetchDepartments();
    }, []);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Future: save to Supabase
        alert('Student record added successfully!');
        onCancel();
    };

    return (
        <div className="flex-1 overflow-y-auto p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-[26px] font-bold text-gray-900 mb-1">Register Student</h1>
                <p className="text-sm text-gray-500 font-medium">Enter the required information to create a new student record and generate their digital pass.</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-3 gap-6 mb-8">
                    {/* Student Photo */}
                    <div className="col-span-1 bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 flex flex-col items-center">
                        <h3 className="text-sm font-semibold text-gray-900 mb-5 self-start">Student Photo</h3>
                        <div className="w-28 h-28 bg-[#f4f6f8] border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center mb-4 cursor-pointer hover:border-[#f47c20] hover:bg-orange-50/30 transition-colors group">
                            <Camera className="w-6 h-6 text-gray-300 group-hover:text-[#f47c20] transition-colors mb-1" />
                            <span className="text-[10px] text-gray-400 font-medium group-hover:text-[#f47c20] transition-colors">Upload Image</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium text-center leading-relaxed mt-auto">
                            Upload a high-quality portrait photo.<br />
                            Max size 2MB (JPG, PNG).
                        </p>
                    </div>

                    {/* Personal Information */}
                    <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
                        <div className="flex items-center gap-2.5 mb-5">
                            <User className="w-4 h-4 text-[#f47c20]" />
                            <h3 className="text-sm font-bold text-gray-900">Personal Information</h3>
                        </div>

                        <div className="space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Johnathan Doe"
                                    value={formData.fullName}
                                    onChange={(e) => handleChange('fullName', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#f47c20]/20 focus:border-[#f47c20] placeholder:text-gray-400"
                                />
                            </div>

                            {/* Student ID & Gender */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Student ID</label>
                                    <input
                                        type="text"
                                        placeholder="VP-2024-001"
                                        value={formData.studentId}
                                        onChange={(e) => handleChange('studentId', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#f47c20]/20 focus:border-[#f47c20] placeholder:text-gray-400"
                                    />
                                </div>
                                <CustomSelect
                                    label="Gender"
                                    value={formData.gender}
                                    options={genderOptions}
                                    onChange={(val) => handleChange('gender', val)}
                                />
                            </div>

                            {/* Email Address */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="student@university.edu"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#f47c20]/20 focus:border-[#f47c20] placeholder:text-gray-400"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Academic Details */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 mb-8">
                    <div className="flex items-center gap-2.5 mb-5">
                        <GraduationCap className="w-4 h-4 text-[#f47c20]" />
                        <h3 className="text-sm font-bold text-gray-900">Academic Details</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <CustomSelect
                            label="Department"
                            value={formData.department}
                            options={departments}
                            placeholder={loading ? 'Loading...' : 'Select'}
                            onChange={(val) => handleChange('department', val)}
                        />
                        <CustomSelect
                            label="Year of Study"
                            value={formData.yearOfStudy}
                            options={yearOptions}
                            onChange={(val) => handleChange('yearOfStudy', val)}
                        />
                    </div>

                    <CustomSelect
                        label="Assigned Hostel/Campus"
                        value={formData.hostel}
                        options={hostelOptions}
                        onChange={(val) => handleChange('hostel', val)}
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2.5 bg-[#f47c20] hover:bg-[#e06d1c] text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
                    >
                        Add Student Record
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegisterStudent;
