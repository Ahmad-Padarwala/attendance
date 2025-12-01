export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export function getCurrentLocation(): Promise<LocationCoords> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error: GeolocationPositionError) => {
        let errorMessage = 'Unable to get location. ';
        
        if (error.code === 1) {
          errorMessage += 'Location permission was denied. Please enable location access in your browser settings.';
        } else if (error.code === 2) {
          errorMessage += 'Location information is unavailable.';
        } else if (error.code === 3) {
          errorMessage += 'Location request timed out. Please try again.';
        } else {
          errorMessage += 'An unknown error occurred.';
        }
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

