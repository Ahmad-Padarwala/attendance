'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AttendanceCalendar from '@/components/AttendanceCalendar';
import PunchButtons from '@/components/PunchButtons';
import AttendanceLogsList from '@/components/AttendanceLogsList';
import ScreenshotsViewer from '@/components/ScreenshotsViewer';
import { formatTime12Hour } from '@/utils/dateUtils';

export default function StaffDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [holidays, setHolidays] = useState<any>([]);
  const [todayStatus, setTodayStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'STAFF') {
      router.push('/admin/staff');
      return;
    }

    setUser(parsedUser);
    fetchAttendance(selectedMonth);
  }, [router, selectedMonth]);

  const fetchAttendance = async (month: string) => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch attendance data
      const attendanceResponse = await fetch(
        `/api/staff/attendance?month=${month}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (attendanceResponse.ok) {
        const data = await attendanceResponse.json();
        setAttendanceData(data.attendanceRecords);
        setTodayStatus(data.todayStatus);
      }

      // Fetch holidays
      const holidaysResponse = await fetch(`/api/holidays?month=${month}`);
      if (holidaysResponse.ok) {
        const holidaysData = await holidaysResponse.json();
        setHolidays(holidaysData.holidays || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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

  const handleActionSuccess = () => {
    fetchAttendance(selectedMonth);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const profile = user.staffProfile;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-50 to-white shadow-md border-b border-gray-100">
        <div className="w-[95%] mx-auto py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {profile?.fullName || user.email}
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">Staff Dashboard</p>
            </div>
            <button
              onClick={handleLogout}
              className="group bg-gradient-to-r from-red-600 to-rose-600 text-white px-5 py-2.5 rounded-xl hover:from-red-700 hover:to-rose-700 transition-all shadow-md hover:shadow-lg font-semibold flex items-center gap-2 hover:scale-105"
            >
              <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>

          {/* Staff Info */}
          {profile && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white/50 backdrop-blur-sm rounded-lg px-4 py-2.5 border border-gray-200 shadow-sm">
                <span className="text-xs text-gray-600 font-medium uppercase tracking-wide">Office Hours</span>
                <p className="font-bold text-gray-900 mt-0.5">
                  {formatTime12Hour(profile.officeTimeIn)} - {formatTime12Hour(profile.officeTimeOut)}
                </p>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-lg px-4 py-2.5 border border-gray-200 shadow-sm">
                <span className="text-xs text-gray-600 font-medium uppercase tracking-wide">Working Days</span>
                <p className="font-bold text-gray-900 mt-0.5">
                  {JSON.parse(profile.workingDays).join(', ')}
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="w-[95%] mx-auto py-8">
        {/* Today's Attendance & Screenshots - Side by Side */}
        <div className={`mb-8 grid gap-6 ${
          (todayStatus?.status === 'punched_in' || todayStatus?.status === 'on_lunch_break' || todayStatus?.status === 'punched_out')
            ? 'lg:grid-cols-2 items-stretch'
            : 'grid-cols-1'
        }`}>
        {/* Punch Buttons */}
          <div className="h-full">
          <PunchButtons
            todayStatus={todayStatus}
            onSuccess={handleActionSuccess}
            workingDays={profile ? JSON.parse(profile.workingDays) : []}
          />
          </div>

          {/* Screenshots Viewer - Show when punched in or has screenshots today */}
          {(todayStatus?.status === 'punched_in' || todayStatus?.status === 'on_lunch_break' || todayStatus?.status === 'punched_out') && (
            <div className="h-full">
              <ScreenshotsViewer />
            </div>
          )}
        </div>

        {/* Month Selector */}
        <div className="mb-6">
          <label htmlFor="month" className="block text-sm font-medium text-gray-900 mb-2">
            Select Month
          </label>
          <input
            id="month"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
        </div>

        {/* Attendance Calendar */}
        <AttendanceCalendar
          attendanceData={attendanceData || []}
          selectedMonth={selectedMonth}
          workingDays={profile ? JSON.parse(profile.workingDays) : []}
          officeTimeIn={profile?.officeTimeIn}
          officeTimeOut={profile?.officeTimeOut}
          holidays={holidays}
        />

        {/* Attendance Logs List */}
        <div className="mt-8">
          <AttendanceLogsList
            logs={attendanceData || []}
            onDelete={handleActionSuccess}
          />
        </div>
      </main>
    </div>
  );
}

