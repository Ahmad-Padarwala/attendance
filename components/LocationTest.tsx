'use client';

import { useState } from 'react';

export default function LocationTest() {
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState('');

  const testLocation = async () => {
    setStatus('Testing...');
    setError('');
    setLocation(null);

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setStatus('❌ Not Supported');
      setError('Geolocation is not supported by your browser');
      return;
    }

    setStatus('✓ Geolocation API Supported');

    // Check permission status
    if (navigator.permissions && (navigator.permissions as any).query) {
      try {
        const permission = await (navigator.permissions as any).query({ name: 'geolocation' });
        setStatus(`Permission Status: ${permission.state}`);

        if (permission.onchange !== undefined) {
          permission.onchange = () => {
            setStatus(`Permission Status Changed: ${permission.state}`);
          };
        }
      } catch (err) {
        console.log('Permission API not available', err);
      }
    }

    // Try to get location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStatus('✅ Location Access Granted!');
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err: GeolocationPositionError) => {
        setStatus('❌ Location Access Denied');
        
        let message = '';
        if (err.code === 1) {
          message = 'User denied location permission. Please allow location access in your browser settings.';
        } else if (err.code === 2) {
          message = 'Location information is unavailable.';
        } else if (err.code === 3) {
          message = 'Location request timed out.';
        } else {
          message = 'An unknown error occurred.';
        }
        setError(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        🧪 Location Permission Test
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        If punch buttons aren't working, test your location permission here first.
      </p>

      <button
        onClick={testLocation}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Test Location Access
      </button>

      {status && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <p className="text-sm font-medium text-gray-900">{status}</p>
        </div>
      )}

      {location && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm font-semibold text-green-800 mb-2">
            ✅ Location Successfully Retrieved!
          </p>
          <p className="text-xs text-gray-700 font-mono">
            Latitude: {location.lat.toFixed(6)}
          </p>
          <p className="text-xs text-gray-700 font-mono">
            Longitude: {location.lng.toFixed(6)}
          </p>
          <p className="text-xs text-green-600 mt-2">
            Location is working! You can now use punch buttons.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-semibold text-red-800 mb-2">❌ Error:</p>
          <p className="text-sm text-red-700">{error}</p>

          <div className="mt-4 text-xs text-gray-800 space-y-2">
            <p className="font-semibold">Windows Location Fix:</p>
            <ol className="list-decimal ml-4 space-y-1">
              <li>
                <strong>Windows Settings:</strong> Press Win+I → Privacy & Security → Location → 
                Turn ON "Location services" → Allow "Desktop apps" to access location
              </li>
              <li>
                <strong>Browser (Chrome/Edge):</strong> Click 🔒 in address bar → 
                Site settings → Location → Allow
              </li>
              <li>
                <strong>Or:</strong> Type in address bar: 
                <code className="bg-gray-200 px-1">chrome://settings/content/location</code>
              </li>
              <li>
                <strong>Add Exception:</strong> Add http://localhost:3002 to allowed sites
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

