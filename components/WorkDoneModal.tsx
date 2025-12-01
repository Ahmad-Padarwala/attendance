'use client';

import { useState, FormEvent } from 'react';

interface WorkDoneModalProps {
  onSubmit: (workDone: string) => void;
  onCancel: () => void;
}

export default function WorkDoneModal({ onSubmit, onCancel }: WorkDoneModalProps) {
  const [workDone, setWorkDone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!workDone.trim()) {
      setError('Please enter what you worked on today');
      return;
    }

    if (workDone.trim().length < 10) {
      setError('Please provide at least 10 characters describing your work');
      return;
    }

    onSubmit(workDone.trim());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-3xl">📝</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Daily Work Summary
              </h3>
              <p className="text-sm text-gray-600">
                Please describe what you accomplished today before punching out
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                What did you work on today? *
              </label>
              <textarea
                value={workDone}
                onChange={(e) => {
                  setWorkDone(e.target.value);
                  setError('');
                }}
                placeholder="Example: Completed user authentication module, fixed 3 bugs in payment system, attended team meeting..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
                autoFocus
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  Minimum 10 characters required
                </p>
                <p className="text-xs text-gray-500">
                  {workDone.length} characters
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition font-semibold"
              >
                Submit & Punch Out
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

