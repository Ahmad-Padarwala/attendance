'use client';

import { useState, useEffect } from 'react';
import { getTodayScreenshots, downloadScreenshot, deleteScreenshot, clearOldScreenshots } from '@/lib/screenCapture';

interface Screenshot {
  id: number;
  dataUrl: string;
  timestamp: string;
  date: string;
  time: string;
  slotStart?: string;
  slotEnd?: string;
  slotLabel?: string;
}

export default function ScreenshotsViewer() {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
  const [showAllModal, setShowAllModal] = useState(false);

  const VISIBLE_COUNT = 4; // Show only 4 recent screenshots

  useEffect(() => {
    loadScreenshots();
  }, []);

  const loadScreenshots = async () => {
    setLoading(true);
    try {
      // Clear old screenshots from previous days first
      await clearOldScreenshots();

      const data = await getTodayScreenshots();
      // Sort by timestamp descending (newest first)
      const sorted = data.sort((a: Screenshot, b: Screenshot) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setScreenshots(sorted);
    } catch (error) {
      console.error('Error loading screenshots:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6 h-full flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-700 font-semibold">Loading screenshots...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Full screen modal for selected screenshot */}
      {selectedScreenshot && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex flex-col"
          onClick={() => setSelectedScreenshot(null)}
        >
          {/* Header with buttons - Always visible */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 bg-black/50" onClick={(e) => e.stopPropagation()}>
            <div className="text-white">
              <div className="text-lg font-semibold">
                {selectedScreenshot.slotLabel || selectedScreenshot.time}
              </div>
              <div className="text-sm text-gray-400">
                {selectedScreenshot.slotLabel && <>Captured at {selectedScreenshot.time} • </>}
                {new Date(selectedScreenshot.timestamp).toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const filename = `screenshot-${selectedScreenshot.date}-${selectedScreenshot.time.replace(/:/g, '-')}.jpg`;
                  downloadScreenshot(selectedScreenshot.dataUrl, filename);
                }}
                className="text-white hover:bg-green-600 text-sm font-semibold bg-green-600/50 px-4 py-2 rounded-lg transition"
              >
                ⬇️ <span className="hidden sm:inline">Download</span>
              </button>
              <button
                onClick={async () => {
                  if (confirm('Delete this screenshot?')) {
                    await deleteScreenshot(selectedScreenshot.id);
                    setSelectedScreenshot(null);
                    loadScreenshots();
                  }
                }}
                className="text-white hover:bg-red-600 text-sm font-semibold bg-red-600/50 px-4 py-2 rounded-lg transition"
              >
                🗑️ <span className="hidden sm:inline">Delete</span>
              </button>
              <button
                onClick={() => setSelectedScreenshot(null)}
                className="text-white hover:bg-white/30 text-xl font-bold bg-white/10 w-10 h-10 rounded-lg transition flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Image container - Scrollable */}
          <div
            className="flex-1 flex items-center justify-center p-4 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedScreenshot.dataUrl}
              alt={`Screenshot at ${selectedScreenshot.time}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={() => setSelectedScreenshot(null)}
            />
          </div>
        </div>
      )}

      {/* View All Screenshots Modal */}
      {showAllModal && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowAllModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                📸 All Screenshots ({screenshots.length})
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadScreenshots}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                <button
                  onClick={() => setShowAllModal(false)}
                  className="text-gray-500 hover:bg-gray-100 w-8 h-8 rounded-lg flex items-center justify-center transition"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {screenshots.map((screenshot) => (
                  <div
                    key={screenshot.id}
                    className="relative group cursor-pointer"
                    onClick={() => {
                      setShowAllModal(false);
                      setSelectedScreenshot(screenshot);
                    }}
                  >
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition">
                      <img
                        src={screenshot.dataUrl}
                        alt={`Screenshot at ${screenshot.time}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-xs px-2 py-1.5 rounded-b-lg">
                      <div className="font-semibold">{screenshot.slotLabel || screenshot.time}</div>
                      {screenshot.slotLabel && (
                        <div className="text-gray-300 text-[10px]">Captured: {screenshot.time}</div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 rounded-lg transition" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            📸 Today's Screenshots ({screenshots.length})
          </h3>
          <button
            onClick={loadScreenshots}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition"
            title="Refresh"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {screenshots.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <div className="text-4xl mb-2">📷</div>
            <p>No screenshots captured today</p>
            <p className="text-sm mt-1">Screenshots are taken every 5 minutes while you're working</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="grid grid-cols-2 gap-3">
              {screenshots.slice(0, VISIBLE_COUNT).map((screenshot) => (
                <div
                  key={screenshot.id}
                  className="relative group cursor-pointer"
                  onClick={() => setSelectedScreenshot(screenshot)}
                >
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition">
                    <img
                      src={screenshot.dataUrl}
                      alt={`Screenshot at ${screenshot.time}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-xs px-2 py-1.5 rounded-b-lg">
                    <div className="font-semibold">{screenshot.slotLabel || screenshot.time}</div>
                  </div>
                  <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 rounded-lg transition" />
                </div>
              ))}
            </div>

            {/* View All Button */}
            {screenshots.length > VISIBLE_COUNT && (
              <button
                onClick={() => setShowAllModal(true)}
                className="mt-4 w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold rounded-lg transition text-sm"
              >
                View All {screenshots.length} Screenshots →
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}

