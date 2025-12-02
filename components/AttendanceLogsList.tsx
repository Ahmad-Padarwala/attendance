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
      <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8 text-center text-gray-700 font-semibold">
        No attendance records yet. Punch in to create your first record!
      </div>
    );
  }

  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/30">
        <h3 className="text-lg font-bold text-gray-900">
          Attendance History ({logs.length} records)
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          View and manage your attendance records
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/20">
          <thead className="bg-white/30 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase">
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
          <tbody className="bg-white/20">
            {logs.map((log) => {
              const isCompleted = !!log.punchOutTime;
              const isPunchInOnly = log.punchInTime && !log.punchOutTime;
              const isOnLeave = log.workDone?.startsWith('ON_LEAVE');

              return (
                <React.Fragment key={log.id}>
                <tr className="hover:bg-white/30 transition-colors">
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
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-2 border-purple-200 shadow-sm">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        On Leave
                      </span>
                    ) : isCompleted ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-200 shadow-sm">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Completed
                      </span>
                    ) : isPunchInOnly ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-2 border-yellow-200 shadow-sm">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-2 border-gray-200 shadow-sm">
                        Incomplete
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {isCompleted ? (
                      <button
                        onClick={() => handleDelete(log.id, true)}
                        className="group inline-flex items-center gap-2 bg-gradient-to-r from-red-100 to-rose-100 hover:from-red-200 hover:to-rose-200 text-red-700 hover:text-red-900 px-3 py-2 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md border border-red-200 hover:scale-105"
                        title="Delete complete day's attendance"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDelete(log.id, false)}
                        className="group inline-flex items-center gap-2 bg-gradient-to-r from-red-100 to-rose-100 hover:from-red-200 hover:to-rose-200 text-red-700 hover:text-red-900 px-3 py-2 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md border border-red-200 hover:scale-105"
                        title="Delete punch-in record"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
                
                {/* Work Done / Leave Reason Row */}
                {log.workDone && (
                  <tr className={isOnLeave ? 'bg-purple-50/40 backdrop-blur-sm' : 'bg-blue-50/40 backdrop-blur-sm'}>
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
                
                {/* Separator Row */}
                <tr className="h-2">
                  <td colSpan={7} className="px-6">
                    <div className="border-b-2 border-dashed border-gray-300/50"></div>
                  </td>
                </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

