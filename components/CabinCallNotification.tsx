'use client';

import { useEffect, useState } from 'react';

interface CabinCall {
    id: number;
    staffId: number;
    adminId: number;
    message: string | null;
    status: string;
    createdAt: string;
    admin: {
        id: number;
        email: string;
        staffProfile: {
            fullName: string;
        } | null;
    };
}

interface CabinCallNotificationProps {
    onCallAcknowledged?: () => void;
}

export default function CabinCallNotification({ onCallAcknowledged }: CabinCallNotificationProps) {
    const [pendingCalls, setPendingCalls] = useState<CabinCall[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);

    // Play notification sound using Web Audio API - Pleasant chime sound
    const playNotificationSound = () => {
        if (isPlaying) return;

        setIsPlaying(true);
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

            // Create a pleasant three-tone chime sequence
            const playTone = (frequency: number, startTime: number, duration: number) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.setValueAtTime(frequency, startTime);
                oscillator.type = 'sine';

                // Smooth envelope for each tone
                gainNode.gain.setValueAtTime(0, startTime);
                gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

                oscillator.start(startTime);
                oscillator.stop(startTime + duration);
            };

            // Three ascending tones: C5, E5, G5 (major chord)
            const now = audioContext.currentTime;
            playTone(523.25, now, 0.3);        // C5
            playTone(659.25, now + 0.15, 0.3); // E5
            playTone(783.99, now + 0.3, 0.5);  // G5

            setTimeout(() => setIsPlaying(false), 1000);
        } catch (error) {
            console.error('Error playing sound:', error);
            setIsPlaying(false);
        }
    };

    // Check for pending calls
    const checkForCalls = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('/api/staff/cabin-calls', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                const newCalls = data.calls || [];

                // Play sound if there are new calls
                if (newCalls.length > 0 && newCalls.length > pendingCalls.length) {
                    playNotificationSound();
                }

                setPendingCalls(newCalls);
            }
        } catch (error) {
            console.error('Error checking for calls:', error);
        }
    };

    // Poll for calls every 5 seconds
    useEffect(() => {
        checkForCalls(); // Initial check
        const interval = setInterval(checkForCalls, 5000);

        return () => clearInterval(interval);
    }, [pendingCalls.length]);

    // Acknowledge a call
    const acknowledgeCall = async (callId: number) => {
        console.log('Acknowledging call:', callId);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                alert('Authentication error. Please log in again.');
                return;
            }

            console.log('Sending acknowledge request...');
            const response = await fetch(`/api/staff/cabin-calls/${callId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: 'ACKNOWLEDGED' }),
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                console.log('Call acknowledged successfully');
                // Remove the acknowledged call from the list
                setPendingCalls(prev => prev.filter(call => call.id !== callId));
                onCallAcknowledged?.();
            } else {
                console.error('Failed to acknowledge call:', data);
                alert(`Failed to acknowledge: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error acknowledging call:', error);
            alert('An error occurred while acknowledging the call');
        }
    };

    if (pendingCalls.length === 0) {
        return null;
    }

    return (
        <>
            {pendingCalls.map((call) => (
                <div
                    key={call.id}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
                >
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-slideUp">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl p-6 text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center animate-pulse">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Cabin Call</h3>
                                    <p className="text-sm text-indigo-100">You are being called to the cabin</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Called by</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {call.admin.staffProfile?.fullName || 'Admin'}
                                        </p>
                                    </div>
                                </div>

                                {call.message && (
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <p className="text-sm text-gray-600 font-medium mb-1">Message:</p>
                                        <p className="text-gray-900">{call.message}</p>
                                    </div>
                                )}

                                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>
                                        {new Date(call.createdAt).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            timeZone: 'Asia/Kolkata'
                                        })}
                                    </span>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={() => acknowledgeCall(call.id)}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-semibold flex items-center justify-center gap-2 hover:scale-105"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Acknowledge
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
        </>
    );
}
