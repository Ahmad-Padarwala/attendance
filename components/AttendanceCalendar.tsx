'use client';

import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';

interface AttendanceRecord {
  id: number;
  date: string;
  punchInTime: string;
  punchOutTime: string | null;
  workingHours: number | null;
  workDone?: string | null;
  lunchBreaks: any[];
}

interface Holiday {
  id: number;
  name: string;
  date: string;
  description?: string;
}

interface AttendanceCalendarProps {
  attendanceData: AttendanceRecord[];
  selectedMonth: string;
  workingDays: string[];
  officeTimeIn?: string;
  officeTimeOut?: string;
  holidays?: Holiday[];
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export default function AttendanceCalendar({
  attendanceData,
  selectedMonth,
  workingDays,
  officeTimeIn,
  officeTimeOut,
  holidays = [],
}: AttendanceCalendarProps) {
  const [year, month] = selectedMonth.split('-').map(Number);
  const monthDate = new Date(year, month - 1, 1);
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);
  const days = eachDayOfInterval({ start, end });

  // Create maps for quick lookup
  const attendanceMap = new Map<string, AttendanceRecord>();
  attendanceData.forEach((record) => {
    const dateKey = format(new Date(record.date), 'yyyy-MM-dd');
    attendanceMap.set(dateKey, record);
  });

  const holidayMap = new Map<string, Holiday>();
  holidays.forEach((holiday) => {
    const dateKey = format(new Date(holiday.date), 'yyyy-MM-dd');
    holidayMap.set(dateKey, holiday);
  });

  // Calculate stats
  const totalWorkingDays = days.filter((day) => {
    const dayName = DAY_NAMES[getDay(day)];
    return workingDays.includes(dayName);
  }).length;

  const totalPresentDays = attendanceData.filter(
    (r) => r.punchInTime && r.punchOutTime && !r.workDone?.startsWith('ON_LEAVE')
  ).length;

  const totalLeaveDays = attendanceData.filter(
    (r) => r.workDone?.startsWith('ON_LEAVE')
  ).length;

  const totalHoursWorked = attendanceData.reduce(
    (sum, r) => sum + (Number(r.workingHours) || 0),
    0
  );

  const firstDayOfMonth = getDay(start);

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Stats */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {format(monthDate, 'MMMM yyyy')} Attendance
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Working Days */}
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg hover:shadow-xl transition-all p-4 group hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-100 uppercase tracking-wide mb-1">Working Days</p>
                <p className="text-3xl font-bold text-white">{totalWorkingDays}</p>
              </div>
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Days Present */}
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg hover:shadow-xl transition-all p-4 group hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wide mb-1">Days Present</p>
                <p className="text-3xl font-bold text-white">{totalPresentDays}</p>
              </div>
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Days on Leave */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg hover:shadow-xl transition-all p-4 group hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-purple-100 uppercase tracking-wide mb-1">On Leave</p>
                <p className="text-3xl font-bold text-white">{totalLeaveDays}</p>
              </div>
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Total Hours */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg hover:shadow-xl transition-all p-4 group hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-indigo-100 uppercase tracking-wide mb-1">Total Hours</p>
                <p className="text-3xl font-bold text-white">{Number(totalHoursWorked).toFixed(2)}h</p>
              </div>
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="p-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-gray-800 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {/* Days of the month */}
          {days.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const attendance = attendanceMap.get(dateKey);
            const holiday = holidayMap.get(dateKey);
            const dayName = DAY_NAMES[getDay(day)];
            const isWorkingDay = workingDays.includes(dayName);
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

            return (
              <div
                key={dateKey}
                className={`aspect-square border rounded-lg p-2 ${
                  isToday
                    ? 'border-blue-500 border-2'
                    : 'border-gray-200'
                } ${
                  holiday
                    ? 'bg-red-50'
                    : !isWorkingDay
                    ? 'bg-gray-50'
                    : 'bg-white'
                }`}
              >
                <div className="flex flex-col h-full">
                  <div className="text-sm font-semibold text-gray-900 mb-1">
                    {format(day, 'd')}
                  </div>

                  {holiday ? (
                    <div className="flex-1 text-xs">
                      <div className="bg-red-100 text-red-800 rounded px-1 py-0.5 mb-1 font-medium">
                        🎉 Holiday
                      </div>
                      <div className="text-gray-800 font-medium break-words">
                        {holiday.name}
                      </div>
                    </div>
                  ) : isWorkingDay && attendance ? (
                    <div className="flex-1 text-xs">
                      {attendance.workDone?.startsWith('ON_LEAVE') ? (
                        <>
                          <div className="bg-purple-100 text-purple-800 rounded px-1 py-0.5 mb-1 font-medium">
                            🟣 On Leave
                          </div>
                          <div className="text-gray-700 text-[10px] mt-1 line-clamp-2">
                            {attendance.workDone.replace('ON_LEAVE: ', '')}
                          </div>
                        </>
                      ) : attendance.punchInTime && attendance.punchOutTime ? (
                        <>
                          <div className="bg-green-100 text-green-800 rounded px-1 py-0.5 mb-1 font-medium">
                            ✓ Present
                          </div>
                          <div className="text-gray-800 font-medium">
                            In: {format(new Date(attendance.punchInTime), 'hh:mm a')}
                          </div>
                          <div className="text-gray-800 font-medium">
                            Out: {format(new Date(attendance.punchOutTime), 'hh:mm a')}
                          </div>
                          {attendance.workingHours && (
                            <div className="font-bold text-blue-600 mt-1">
                              {Number(attendance.workingHours).toFixed(2)}h
                            </div>
                          )}
                        </>
                      ) : attendance.punchInTime ? (
                        <>
                          <div className="bg-yellow-100 text-yellow-800 rounded px-1 py-0.5 mb-1 font-medium">
                            ⏳ Active
                          </div>
                          <div className="text-gray-800 font-medium">
                            In: {format(new Date(attendance.punchInTime), 'hh:mm a')}
                          </div>
                        </>
                      ) : null}
                    </div>
                  ) : isWorkingDay && format(day, 'yyyy-MM-dd') < format(new Date(), 'yyyy-MM-dd') ? (
                    <div className="bg-red-100 text-red-800 text-xs rounded px-1 py-0.5">
                      ✗ Absent
                    </div>
                  ) : !isWorkingDay ? (
                    <div className="text-xs text-gray-400">
                      Off Day
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

