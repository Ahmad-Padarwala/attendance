'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AttendanceCalendar from '@/components/AttendanceCalendar';

export default function StaffDetailPage() {
  const router = useRouter();
  const params = useParams();
  const staffId = params?.id as string;

  const [staff, setStaff] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [holidays, setHolidays] = useState<any>([]);
  const [statistics, setStatistics] = useState<any>(null);
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
    if (parsedUser.role !== 'ADMIN') {
      router.push('/staff/dashboard');
      return;
    }

    fetchStaffAttendance(selectedMonth);
  }, [router, staffId, selectedMonth]);

  const fetchStaffAttendance = async (month: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/admin/staff/${staffId}/attendance?month=${month}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStaff(data.staff);
        setAttendanceData(data.attendanceRecords);
        setHolidays(data.holidays || []);
        setStatistics(data.statistics);
      } else {
        alert('Failed to fetch staff attendance');
      }
    } catch (error) {
      console.error('Error fetching staff attendance:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/admin/staff');
  };

  if (loading || !staff) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const profile = staff.staffProfile;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleBack}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
            >
              ← Back to Staff List
            </button>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile?.fullName || staff.email}
              </h1>
              <p className="text-sm text-gray-600">Staff Attendance Details</p>
            </div>
          </div>

          {/* Staff Info */}
          {profile && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-700 font-medium">Email:</span>{' '}
                <span className="font-semibold text-gray-900">{staff.email}</span>
              </div>
              <div>
                <span className="text-gray-700 font-medium">Salary:</span>{' '}
                <span className="font-semibold text-gray-900">
                  ${Number(profile.salary).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-700 font-medium">Office Hours:</span>{' '}
                <span className="font-semibold text-gray-900">
                  {profile.officeTimeIn} - {profile.officeTimeOut}
                </span>
              </div>
              <div>
                <span className="text-gray-700 font-medium">Working Days:</span>{' '}
                <span className="font-semibold text-gray-900">
                  {JSON.parse(profile.workingDays).join(', ')}
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm font-medium text-gray-700">Total Hours Worked</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {statistics?.totalHoursWorked || 0}h
            </p>
            <p className="text-xs text-gray-600 mt-1">
              of {statistics?.expectedTotalHours || 0}h expected
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm font-medium text-gray-700">Expected Hours</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {statistics?.expectedTotalHours || 0}h
            </p>
            <p className="text-xs text-gray-600 mt-1">Based on working days</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm font-medium text-gray-700">Days Completed</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {statistics?.completedDays || 0}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              of {statistics?.expectedWorkingDays || 0} expected
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm font-medium text-gray-700">
              {statistics?.totalHoursWorked >= statistics?.expectedTotalHours
                ? 'Overtime'
                : 'Remaining'}
            </p>
            <p
              className={`text-3xl font-bold mt-2 ${
                statistics?.totalHoursWorked >= statistics?.expectedTotalHours
                  ? 'text-purple-600'
                  : 'text-orange-600'
              }`}
            >
              {Math.abs(
                (statistics?.totalHoursWorked || 0) -
                  (statistics?.expectedTotalHours || 0)
              ).toFixed(2)}
              h
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {statistics?.totalHoursWorked >= statistics?.expectedTotalHours
                ? 'Extra hours worked'
                : 'Hours to complete'}
            </p>
          </div>
        </div>

        {/* Location Tracking Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">📍</div>
            <div>
              <h3 className="font-semibold text-blue-900">GPS Location Tracking Enabled</h3>
              <p className="text-sm text-blue-800 mt-1">
                All punch in/out actions are tracked with GPS coordinates. Click "View on Map" in the table below to see exact locations on Google Maps.
              </p>
            </div>
          </div>
        </div>

        {/* Month Selector */}
        <div className="mb-6">
          <label
            htmlFor="month"
            className="block text-sm font-medium text-gray-900 mb-2"
          >
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

        {/* Detailed Table */}
        <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Detailed Attendance Records
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Punch In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Punch Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Lunch Breaks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Working Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceData && attendanceData.length > 0 ? (
                  attendanceData.map((record: any) => (
                    <React.Fragment key={record.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {record.punchInTime
                            ? new Date(record.punchInTime).toLocaleTimeString(
                                'en-US',
                                { hour: '2-digit', minute: '2-digit' }
                              )
                            : '-'}
                        </div>
                        {record.punchInLat && record.punchInLng ? (
                          <div className="mt-1">
                            <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block mb-1">
                              📍 Location
                            </div>
                            <div className="text-xs text-gray-700 font-mono">
                              Lat: {Number(record.punchInLat).toFixed(6)}
                            </div>
                            <div className="text-xs text-gray-700 font-mono mb-1">
                              Lng: {Number(record.punchInLng).toFixed(6)}
                            </div>
                            <a
                              href={`https://www.google.com/maps?q=${record.punchInLat},${record.punchInLng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                              🗺️ View on Map
                            </a>
                          </div>
                        ) : (
                          record.punchInTime && (
                            <div className="text-xs text-red-600 mt-1">
                              No location data
                            </div>
                          )
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {record.punchOutTime
                            ? new Date(record.punchOutTime).toLocaleTimeString(
                                'en-US',
                                { hour: '2-digit', minute: '2-digit' }
                              )
                            : '-'}
                        </div>
                        {record.punchOutLat && record.punchOutLng ? (
                          <div className="mt-1">
                            <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block mb-1">
                              📍 Location
                            </div>
                            <div className="text-xs text-gray-700 font-mono">
                              Lat: {Number(record.punchOutLat).toFixed(6)}
                            </div>
                            <div className="text-xs text-gray-700 font-mono mb-1">
                              Lng: {Number(record.punchOutLng).toFixed(6)}
                            </div>
                            <a
                              href={`https://www.google.com/maps?q=${record.punchOutLat},${record.punchOutLng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                              🗺️ View on Map
                            </a>
                          </div>
                        ) : (
                          record.punchOutTime && (
                            <div className="text-xs text-red-600 mt-1">
                              No location data
                            </div>
                          )
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {record.lunchBreaks.length > 0 ? (
                            record.lunchBreaks.map((lunch: any, idx: number) => (
                              <div key={lunch.id} className="mb-1">
                                {lunch.lunchStartTime &&
                                  new Date(lunch.lunchStartTime).toLocaleTimeString(
                                    'en-US',
                                    { hour: '2-digit', minute: '2-digit' }
                                  )}
                                {' - '}
                                {lunch.lunchEndTime
                                  ? new Date(lunch.lunchEndTime).toLocaleTimeString(
                                      'en-US',
                                      { hour: '2-digit', minute: '2-digit' }
                                    )
                                  : 'Active'}
                                {lunch.duration && (
                                  <span className="text-xs text-gray-600">
                                    {' '}
                                    ({lunch.duration}min)
                                  </span>
                                )}
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-blue-600">
                          {record.workingHours
                            ? `${Number(record.workingHours).toFixed(2)}h`
                            : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.punchOutTime ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Completed
                          </span>
                        ) : record.punchInTime ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            Incomplete
                          </span>
                        )}
                      </td>
                    </tr>
                    
                    {/* Work Done Row */}
                    {record.workDone && (
                      <tr className="bg-blue-50">
                        <td colSpan={6} className="px-6 py-3">
                          <div className="flex items-start gap-2">
                            <div className="text-blue-600 font-semibold text-sm mt-0.5">
                              📝 Work Done:
                            </div>
                            <div className="text-sm text-gray-800 flex-1">
                              {record.workDone}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No attendance records for this month
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

