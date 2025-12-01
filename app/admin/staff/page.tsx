'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StaffList from '@/components/StaffList';
import CreateStaffForm from '@/components/CreateStaffForm';

export default function AdminStaffPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'ADMIN') {
      router.push('/staff/dashboard');
      return;
    }

    setUser(parsedUser);
    fetchStaff();
  }, [router]);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/staff', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStaffList(data.staff);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleStaffCreated = () => {
    setShowForm(false);
    fetchStaff();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Manage staff members</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/admin/holidays')}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              🎉 Manage Holidays
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Staff Members ({staffList.length})
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {showForm ? 'Cancel' : '+ Add New Staff'}
          </button>
        </div>

        {showForm && (
          <div className="mb-8">
            <CreateStaffForm onSuccess={handleStaffCreated} />
          </div>
        )}

        <StaffList staff={staffList} onUpdate={fetchStaff} />
      </main>
    </div>
  );
}

