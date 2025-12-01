'use client';

import { useState, useEffect } from 'react';
import { getCurrentLocation } from '@/lib/location';
import WorkDoneModal from './WorkDoneModal';

interface PunchButtonsProps {
  todayStatus: any;
  onSuccess: () => void;
  workingDays?: string[];
}

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export default function PunchButtons({
  todayStatus,
  onSuccess,
  workingDays = [],
}: PunchButtonsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isWorkingDay, setIsWorkingDay] = useState(true);
  const [todayDayName, setTodayDayName] = useState('');
  const [showWorkDoneModal, setShowWorkDoneModal] = useState(false);

  useEffect(() => {
    const today = new Date();
    const dayName = DAY_NAMES[today.getDay()];
    setTodayDayName(dayName);
    setIsWorkingDay(workingDays.includes(dayName));
  }, [workingDays]);

  const makeRequest = async (endpoint: string, additionalData?: any) => {
    setError('');
    setLoading(true);

    try {
      // Get location
      const location = await getCurrentLocation();

      // Make API request
      const token = localStorage.getItem('token');
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          ...additionalData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setError(data.error || 'Operation failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please enable location access.');
    } finally {
      setLoading(false);
    }
  };

  const handlePunchIn = () => makeRequest('/api/staff/punch-in');
  
  const handlePunchOut = () => {
    // Show work done modal instead of directly punching out
    setShowWorkDoneModal(true);
  };

  const handleWorkDoneSubmit = (workDone: string) => {
    setShowWorkDoneModal(false);
    makeRequest('/api/staff/punch-out', { workDone });
  };

  const handleWorkDoneCancel = () => {
    setShowWorkDoneModal(false);
  };

  const handleLunchStart = () => makeRequest('/api/staff/lunch-start');
  const handleLunchEnd = () => makeRequest('/api/staff/lunch-end');

  const status = todayStatus?.status || 'not_punched_in';

  return (
    <>
      {showWorkDoneModal && (
        <WorkDoneModal
          onSubmit={handleWorkDoneSubmit}
          onCancel={handleWorkDoneCancel}
        />
      )}

      <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Today's Attendance
      </h2>

      {/* Status Display */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              status === 'not_punched_in'
                ? 'bg-gray-400'
                : status === 'punched_in'
                ? 'bg-green-500'
                : status === 'on_lunch_break'
                ? 'bg-yellow-500'
                : 'bg-blue-500'
            }`}
          />
          <span className="text-lg font-medium">
            {status === 'not_punched_in' && 'Not Punched In'}
            {status === 'punched_in' && 'Punched In - Working'}
            {status === 'on_lunch_break' && 'On Lunch Break'}
            {status === 'punched_out' && 'Punched Out - Day Complete'}
          </span>
        </div>

        {todayStatus?.record && (
          <div className="mt-3 text-sm text-gray-900 space-y-1 font-medium">
            <p>
              Punch In:{' '}
              {new Date(todayStatus.record.punchInTime).toLocaleTimeString()}
            </p>
            {todayStatus.record.punchOutTime && (
              <p>
                Punch Out:{' '}
                {new Date(todayStatus.record.punchOutTime).toLocaleTimeString()}
              </p>
            )}
            {todayStatus.record.workingHours && (
              <p className="font-bold text-green-600">
                Working Hours: {Number(todayStatus.record.workingHours).toFixed(2)} hrs
              </p>
            )}
          </div>
        )}
      </div>

      {/* Non-Working Day Warning */}
      {!isWorkingDay && status === 'not_punched_in' && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg">
          <p className="font-semibold">⚠️ Not a Working Day</p>
          <p className="text-sm mt-1">
            Today is {todayDayName}. Your working days are: {workingDays.join(', ')}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        {status === 'not_punched_in' && (
          <button
            onClick={handlePunchIn}
            disabled={loading || !isWorkingDay}
            className="col-span-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
          >
            {loading ? 'Processing...' : '🕐 Punch In'}
          </button>
        )}

        {status === 'punched_in' && (
          <>
            <button
              onClick={handleLunchStart}
              disabled={loading}
              className="bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 focus:ring-4 focus:ring-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
            >
              {loading ? 'Processing...' : '🍽️ Start Lunch'}
            </button>
            <button
              onClick={handlePunchOut}
              disabled={loading}
              className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
            >
              {loading ? 'Processing...' : '🏁 Punch Out'}
            </button>
          </>
        )}

        {status === 'on_lunch_break' && (
          <button
            onClick={handleLunchEnd}
            disabled={loading}
            className="col-span-2 bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 focus:ring-4 focus:ring-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
          >
            {loading ? 'Processing...' : '✓ End Lunch Break'}
          </button>
        )}

        {status === 'punched_out' && (
          <div className="col-span-2 bg-blue-50 text-blue-700 py-3 px-4 rounded-lg text-center">
            Attendance completed for today! Have a great day! 🎉
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-sm">
          <div className="font-semibold mb-2">⚠️ Error: {error}</div>
          {error.includes('permission') || error.includes('denied') ? (
            <div className="mt-2 text-xs space-y-2">
              <p className="font-semibold">To enable location access:</p>
              <ol className="list-decimal ml-4 space-y-1">
                <li>Click the 🔒 lock icon in your address bar</li>
                <li>Find "Location" permission</li>
                <li>Change it to "Allow"</li>
                <li>Refresh this page and try again</li>
              </ol>
              <p className="mt-2 text-red-600">
                Location access is required to verify your attendance location.
              </p>
            </div>
          ) : null}
        </div>
      )}
      </div>
    </>
  );
}

