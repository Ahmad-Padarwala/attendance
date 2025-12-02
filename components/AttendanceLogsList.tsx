'use client';

import React from 'react';
import { format } from 'date-fns';

interface AttendanceLog {
  id: number;
  date: string;
  punchInTime: string;
  punchOutTime: string | null;
  workingHours: number | null;
  workDone: string | null;
  lunchBreaks: any[];
}

interface AttendanceLogsListProps {
  logs: AttendanceLog[];
  onDelete: () => void;
}

export default function AttendanceLogsList({ logs, onDelete }: AttendanceLogsListProps) {
  const handleDelete = async (recordId: number, isCompleted: boolean) => {
    const confirmMessage = isCompleted
      ? 'This will delete the complete attendance record for this day including lunch breaks. Are you sure?'
      : 'Are you sure you want to delete this punch-in record?';

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/staff/attendance/delete?id=${recordId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert('Attendance record deleted successfully');
        onDelete();
      } else {
        alert(data.error || 'Failed to delete record');
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('An error occurred while deleting');
    }
  };

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        No attendance records yet. Punch in to create your first record!
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Attendance History ({logs.length} records)
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          View and manage your attendance records
        </p>
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
                Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => {
              const isCompleted = !!log.punchOutTime;
              const isPunchInOnly = log.punchInTime && !log.punchOutTime;
              const isOnLeave = log.workDone?.startsWith('ON_LEAVE');

              return (
                <React.Fragment key={log.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {format(new Date(log.date), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-xs text-gray-600">
                      {format(new Date(log.date), 'EEEE')}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(new Date(log.punchInTime), 'hh:mm a')}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {log.punchOutTime
                        ? format(new Date(log.punchOutTime), 'hh:mm a')
                        : '-'}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {log.lunchBreaks.length > 0 ? (
                      <div className="text-sm text-gray-900">
                        {log.lunchBreaks.map((lunch: any, idx: number) => (
                          <div key={idx} className="mb-1">
                            {lunch.lunchStartTime &&
                              format(new Date(lunch.lunchStartTime), 'hh:mm a')}
                            {' - '}
                            {lunch.lunchEndTime
                              ? format(new Date(lunch.lunchEndTime), 'hh:mm a')
                              : 'Active'}
                            {lunch.duration && (
                              <span className="text-xs text-gray-600">
                                {' '}
                                ({lunch.duration}min)
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No breaks</span>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-blue-600">
                      {log.workingHours
                        ? `${Number(log.workingHours).toFixed(2)}h`
                        : '-'}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {isOnLeave ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        🟣 On Leave
                      </span>
                    ) : isCompleted ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        ✓ Completed
                      </span>
                    ) : isPunchInOnly ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        ⏳ Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        Incomplete
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {isCompleted ? (
                      <button
                        onClick={() => handleDelete(log.id, true)}
                        className="text-red-600 hover:text-red-900 font-medium"
                        title="Delete complete day's attendance"
                      >
                        🗑️ Delete Day
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDelete(log.id, false)}
                        className="text-red-600 hover:text-red-900 font-medium"
                        title="Delete punch-in record"
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </td>
                </tr>
                
                {/* Work Done / Leave Reason Row */}
                {log.workDone && (
                  <tr className={isOnLeave ? 'bg-purple-50' : 'bg-blue-50'}>
                    <td colSpan={7} className="px-6 py-3">
                      <div className="flex items-start gap-2">
                        <div className={`font-semibold text-sm mt-0.5 ${isOnLeave ? 'text-purple-600' : 'text-blue-600'}`}>
                          {isOnLeave ? '🟣 Leave Reason:' : '📝 Work Done:'}
                        </div>
                        <div className="text-sm text-gray-800 flex-1">
                          {isOnLeave 
                            ? log.workDone.replace('ON_LEAVE: ', '') 
                            : log.workDone}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

