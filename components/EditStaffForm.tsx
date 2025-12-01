'use client';

import { useState, useEffect, FormEvent } from 'react';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

interface EditStaffFormProps {
  staff: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditStaffForm({ staff, onSuccess, onCancel }: EditStaffFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    salary: '',
    workingDays: [] as string[],
    officeTimeIn: '09:00',
    officeTimeOut: '18:00',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (staff && staff.staffProfile) {
      setFormData({
        email: staff.email || '',
        password: '', // Don't show existing password
        fullName: staff.staffProfile.fullName || '',
        salary: staff.staffProfile.salary?.toString() || '',
        workingDays: JSON.parse(staff.staffProfile.workingDays || '[]'),
        officeTimeIn: staff.staffProfile.officeTimeIn || '09:00',
        officeTimeOut: staff.staffProfile.officeTimeOut || '18:00',
      });
    }
  }, [staff]);

  const handleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.workingDays.length === 0) {
      setError('Please select at least one working day');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Prepare data - only include password if it's been changed
      const updateData: any = {
        email: formData.email,
        fullName: formData.fullName,
        salary: formData.salary,
        workingDays: formData.workingDays,
        officeTimeIn: formData.officeTimeIn,
        officeTimeOut: formData.officeTimeOut,
      };

      // Only include password if it's not empty
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`/api/admin/staff/${staff.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Staff updated successfully!');
        onSuccess();
      } else {
        setError(data.error || 'Failed to update staff');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Edit Staff Member
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  New Password (leave empty to keep current)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  minLength={6}
                  placeholder="Leave empty to keep current password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Salary
                </label>
                <input
                  type="number"
                  value={formData.salary}
                  onChange={(e) =>
                    setFormData({ ...formData, salary: e.target.value })
                  }
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Office Time In
                </label>
                <input
                  type="time"
                  value={formData.officeTimeIn}
                  onChange={(e) =>
                    setFormData({ ...formData, officeTimeIn: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Office Time Out
                </label>
                <input
                  type="time"
                  value={formData.officeTimeOut}
                  onChange={(e) =>
                    setFormData({ ...formData, officeTimeOut: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Working Days
              </label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`px-4 py-2 rounded-lg border transition ${
                      formData.workingDays.includes(day)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-900 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Updating...' : 'Update Staff Member'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

