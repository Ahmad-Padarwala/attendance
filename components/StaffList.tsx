'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EditStaffForm from './EditStaffForm';
import { formatTime12Hour } from '@/utils/dateUtils';

interface StaffStatus {
  status: 'not_punched_in' | 'punched_in' | 'on_lunch_break' | 'punched_out' | 'on_leave';
  punchInTime: string | null;
  punchOutTime: string | null;
  workingHours: number | null;
}

interface Staff {
  id: number;
  email: string;
  role: string;
  staffProfile?: {
    fullName: string;
    salary: number;
    workingDays: string;
    officeTimeIn: string;
    officeTimeOut: string;
  };
  currentStatus?: StaffStatus;
}

interface StaffListProps {
  staff: Staff[];
  onUpdate: () => void;
}

const getStatusDisplay = (status?: string) => {
  switch (status) {
    case 'punched_in':
      return {
        label: 'Working',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        )
      };
    case 'on_lunch_break':
      return {
        label: 'On Lunch',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      };
    case 'punched_out':
      return {
        label: 'Day Complete',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      };
    case 'on_leave':
      return {
        label: 'On Leave',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      };
    case 'not_punched_in':
    default:
      return {
        label: 'Not Logged In',
        color: 'bg-gray-100 text-gray-600 border-gray-200',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )
      };
  }
};

const STATUS_OPTIONS = [
  { value: 'all', label: '📋 All Status', color: 'text-gray-700' },
  { value: 'punched_in', label: '✓ Working', color: 'text-green-600' },
  { value: 'on_lunch_break', label: '⏱ On Lunch', color: 'text-yellow-600' },
  { value: 'punched_out', label: '✓ Day Complete', color: 'text-blue-600' },
  { value: 'on_leave', label: '📅 On Leave', color: 'text-purple-600' },
  { value: 'not_punched_in', label: '○ Not Logged In', color: 'text-gray-500' },
];

export default function StaffList({ staff, onUpdate }: StaffListProps) {
  const router = useRouter();
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter staff based on search query and status
  const filteredStaff = staff.filter((member) => {
    const query = searchQuery.toLowerCase();
    const name = member.staffProfile?.fullName?.toLowerCase() || '';
    const email = member.email.toLowerCase();
    const matchesSearch = name.includes(query) || email.includes(query);
    const matchesStatus = statusFilter === 'all' || member.currentStatus?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (id: number) => {
    router.push(`/admin/staff/${id}`);
  };

  const handleEdit = (member: Staff) => {
    setEditingStaff(member);
  };

  const handleEditSuccess = () => {
    setEditingStaff(null);
    onUpdate();
  };

  const handleEditCancel = () => {
    setEditingStaff(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this staff member?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/staff/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Staff deleted successfully');
        onUpdate();
      } else {
        alert('Failed to delete staff');
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('An error occurred');
    }
  };

  if (staff.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        No staff members yet. Click "Add New Staff" to create one.
      </div>
    );
  }

  return (
    <>
      {editingStaff && (
        <EditStaffForm
          staff={editingStaff}
          onSuccess={handleEditSuccess}
          onCancel={handleEditCancel}
        />
      )}

      {/* Search Bar and Filter */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="relative group">
          <div className={`absolute inset-0 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity ${statusFilter === 'punched_in' ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
              statusFilter === 'on_lunch_break' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                statusFilter === 'punched_out' ? 'bg-gradient-to-r from-blue-400 to-cyan-500' :
                  statusFilter === 'on_leave' ? 'bg-gradient-to-r from-purple-400 to-pink-500' :
                    statusFilter === 'not_punched_in' ? 'bg-gradient-to-r from-gray-400 to-slate-500' :
                      'bg-gradient-to-r from-indigo-400 to-blue-500'
            }`}></div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <div className={`flex items-center ${statusFilter === 'punched_in' ? 'text-green-600' :
                  statusFilter === 'on_lunch_break' ? 'text-yellow-600' :
                    statusFilter === 'punched_out' ? 'text-blue-600' :
                      statusFilter === 'on_leave' ? 'text-purple-600' :
                        statusFilter === 'not_punched_in' ? 'text-gray-600' :
                          'text-indigo-600'
                }`}>
                {statusFilter === 'punched_in' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                )}
                {statusFilter === 'on_lunch_break' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {statusFilter === 'punched_out' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {statusFilter === 'on_leave' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
                {statusFilter === 'not_punched_in' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                )}
                {statusFilter === 'all' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                )}
              </div>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`relative appearance-none w-full sm:w-64 pl-12 pr-10 py-3 bg-white/90 backdrop-blur-sm border-2 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg cursor-pointer ${statusFilter === 'punched_in' ? 'border-green-300 focus:ring-green-500 text-green-700' :
                  statusFilter === 'on_lunch_break' ? 'border-yellow-300 focus:ring-yellow-500 text-yellow-700' :
                    statusFilter === 'punched_out' ? 'border-blue-300 focus:ring-blue-500 text-blue-700' :
                      statusFilter === 'on_leave' ? 'border-purple-300 focus:ring-purple-500 text-purple-700' :
                        statusFilter === 'not_punched_in' ? 'border-gray-300 focus:ring-gray-500 text-gray-700' :
                          'border-indigo-300 focus:ring-indigo-500 text-indigo-700'
                }`}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className={`w-5 h-5 transition-colors ${statusFilter === 'punched_in' ? 'text-green-500' :
                  statusFilter === 'on_lunch_break' ? 'text-yellow-500' :
                    statusFilter === 'punched_out' ? 'text-blue-500' :
                      statusFilter === 'on_leave' ? 'text-purple-500' :
                        statusFilter === 'not_punched_in' ? 'text-gray-500' :
                          'text-indigo-500'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Results Info */}
      {(searchQuery || statusFilter !== 'all') && (
        <div className="mb-3 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg px-4 py-2.5 border border-blue-100">
          <p className="text-sm font-semibold text-gray-700">
            Showing <span className="text-blue-600">{filteredStaff.length}</span> of <span className="text-gray-900">{staff.length}</span> staff members
          </p>
          {(searchQuery || statusFilter !== 'all') && (
            <button
              onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
              className="group flex items-center gap-1.5 bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg font-semibold text-sm transition-all shadow-sm hover:shadow-md border border-blue-200"
            >
              <svg className="w-4 h-4 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear filters
            </button>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <span className="text-green-600">●</span> Punch In
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <span className="text-red-600">●</span> Punch Out
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <span className="text-blue-600">⏱️</span> Total Hours
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Office Hours
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Working Days
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStaff.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No staff found matching "{searchQuery}"
                </td>
              </tr>
            ) : null}
            {filteredStaff.map((member) => {
              const statusDisplay = getStatusDisplay(member.currentStatus?.status);
              return (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">
                        {member.staffProfile?.fullName || 'N/A'}
                      </span>
                      <span className="text-xs text-gray-500">{member.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusDisplay.color}`}>
                      {statusDisplay.icon}
                      {statusDisplay.label}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {member.currentStatus?.punchInTime ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(member.currentStatus.punchInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {member.currentStatus?.punchOutTime ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(member.currentStatus.punchOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {member.currentStatus?.workingHours !== null && member.currentStatus?.workingHours !== undefined ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-blue-600">
                          {Number(member.currentStatus.workingHours).toFixed(2)}h
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatTime12Hour(member.staffProfile?.officeTimeIn || '')} -{' '}
                      {formatTime12Hour(member.staffProfile?.officeTimeOut || '')}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-xs text-gray-700">
                      {member.staffProfile?.workingDays
                        ? JSON.parse(member.staffProfile.workingDays)
                          .map((d: string) => d.slice(0, 3))
                          .join(', ')
                        : 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(member.id)}
                        className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-lg transition"
                        title="View Details"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEdit(member)}
                        className="text-green-600 hover:text-green-800 p-1.5 hover:bg-green-50 rounded-lg transition"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="text-red-600 hover:text-red-800 p-1.5 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

