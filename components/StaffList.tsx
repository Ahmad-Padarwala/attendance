'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EditStaffForm from './EditStaffForm';

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
}

interface StaffListProps {
  staff: Staff[];
  onUpdate: () => void;
}

export default function StaffList({ staff, onUpdate }: StaffListProps) {
  const router = useRouter();
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

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

      <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Salary
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Office Hours
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Working Days
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {staff.map((member) => (
            <tr key={member.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {member.staffProfile?.fullName || 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{member.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  ${member.staffProfile?.salary.toLocaleString() || '0'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {member.staffProfile?.officeTimeIn} -{' '}
                  {member.staffProfile?.officeTimeOut}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {member.staffProfile?.workingDays
                    ? JSON.parse(member.staffProfile.workingDays)
                        .map((d: string) => d.slice(0, 3))
                        .join(', ')
                    : 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                <button
                  onClick={() => handleViewDetails(member.id)}
                  className="text-blue-600 hover:text-blue-900 font-medium"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleEdit(member)}
                  className="text-green-600 hover:text-green-900 font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="text-red-600 hover:text-red-900 font-medium"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}

