'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StaffList from '@/components/StaffList';
import CreateStaffForm from '@/components/CreateStaffForm';

interface StatusSummary {
  total: number;
  punchedIn: number;
  onLunch: number;
  punchedOut: number;
  notPunchedIn: number;
}

export default function AdminStaffPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [summary, setSummary] = useState<StatusSummary | null>(null);
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
        setSummary(data.summary);
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
        {/* Staff Status Summary */}
        {summary && (
          <div className="mb-8 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Staff</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-green-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🟢</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-600">Working</p>
                  <p className="text-2xl font-bold text-green-700">{summary.punchedIn}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🍽️</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-600">On Lunch</p>
                  <p className="text-2xl font-bold text-yellow-700">{summary.onLunch}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Day Complete</p>
                  <p className="text-2xl font-bold text-blue-700">{summary.punchedOut}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">⏳</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Not Logged In</p>
                  <p className="text-2xl font-bold text-gray-700">{summary.notPunchedIn}</p>
                </div>
              </div>
            </div>
          </div>
        )}

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

