'use client';

import { useState } from 'react';

interface LeaveReasonModalProps {
  onSubmit: (reason: string) => void;
  onCancel: () => void;
}

export default function LeaveReasonModal({ onSubmit, onCancel }: LeaveReasonModalProps) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onSubmit(reason.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Leave Request</h2>
              <p className="text-sm text-gray-500">Please provide a reason for your leave</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Personal reasons, Medical appointment, Family emergency..."
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
              autoFocus
            />

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!reason.trim()}
                className="flex-1 bg-gradient-to-r from-purple-500 to-violet-600 text-white py-3 px-4 rounded-xl hover:from-purple-600 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md font-semibold"
              >
                Submit Leave
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

