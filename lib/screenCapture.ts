// Screen Capture Utility for Staff Monitoring
// Captures screenshots periodically and stores them locally in IndexedDB

const DB_NAME = 'AttendanceScreenshots';
const STORE_NAME = 'screenshots';
const DB_VERSION = 1;

// Screenshot capture interval (in milliseconds) - 5 minutes
const CAPTURE_INTERVAL = 5 * 60 * 1000;

let mediaStream: MediaStream | null = null;
let captureInterval: NodeJS.Timeout | null = null;
let db: IDBDatabase | null = null;
let isPaused: boolean = false;

// Initialize IndexedDB
async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('date', 'date', { unique: false });
      }
    };
  });
}

// Request screen capture permission
export async function requestScreenPermission(): Promise<boolean> {
  try {
    // Request screen capture with constraints to prefer entire screen
    mediaStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: 'monitor', // Prefer entire monitor/screen
        // @ts-ignore - These are valid but TypeScript doesn't recognize them
        monitorTypeSurfaces: 'include',
        surfaceSwitching: 'exclude', // Don't allow switching surfaces
        selfBrowserSurface: 'exclude', // Don't show current tab option
        systemAudio: 'exclude',
      },
      audio: false,
      // @ts-ignore
      preferCurrentTab: false, // Don't prefer current tab
    });

    // Check if we got the stream
    if (mediaStream && mediaStream.getVideoTracks().length > 0) {
      // Listen for when user stops sharing
      mediaStream.getVideoTracks()[0].onended = () => {
        stopScreenCapture();
      };
      return true;
    }
    return false;
  } catch (error: any) {
    console.error('Screen capture permission denied:', error);
    return false;
  }
}

// Check if screen capture is active
export function isScreenCaptureActive(): boolean {
  return mediaStream !== null && mediaStream.active;
}

// Capture a screenshot from the stream
async function captureScreenshot(): Promise<string | null> {
  if (!mediaStream || !mediaStream.active) {
    return null;
  }

  try {
    const videoTrack = mediaStream.getVideoTracks()[0];
    if (!videoTrack) return null;

    // Create a video element to capture frame
    const video = document.createElement('video');
    video.srcObject = mediaStream;
    video.muted = true;
    
    await new Promise<void>((resolve) => {
      video.onloadedmetadata = () => {
        video.play();
        resolve();
      };
    });

    // Wait a frame for video to render
    await new Promise((resolve) => requestAnimationFrame(resolve));

    // Create canvas and draw the frame
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(video, 0, 0);

    // Convert to compressed JPEG for smaller storage
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

    // Clean up
    video.pause();
    video.srcObject = null;

    return dataUrl;
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    return null;
  }
}

// Calculate 5-minute time slot for a given time (12-hour format)
function getTimeSlot(date: Date): { slotStart: string; slotEnd: string; slotLabel: string } {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  // Round down to nearest 5-minute interval for start
  const slotStartMinutes = Math.floor(minutes / 5) * 5;
  const slotEndMinutes = slotStartMinutes + 5;
  
  // Handle hour overflow
  const slotStartHour = hours;
  const slotEndHour = slotEndMinutes >= 60 ? (hours + 1) % 24 : hours;
  const adjustedEndMinutes = slotEndMinutes >= 60 ? slotEndMinutes - 60 : slotEndMinutes;
  
  // Format times in 12-hour format
  const formatTime12 = (h: number, m: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12; // Convert 0 to 12 for 12 AM
    const min = m.toString().padStart(2, '0');
    return `${hour12}:${min} ${period}`;
  };
  
  const slotStart = formatTime12(slotStartHour, slotStartMinutes);
  const slotEnd = formatTime12(slotEndHour, adjustedEndMinutes);
  const slotLabel = `${slotStart} - ${slotEnd}`;
  
  return { slotStart, slotEnd, slotLabel };
}

// Save screenshot to IndexedDB
async function saveScreenshot(dataUrl: string): Promise<void> {
  try {
    if (!db) {
      db = await initDB();
    }

    const now = new Date();
    // Convert to IST for time slot calculation
    const nowIST = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const timeSlot = getTimeSlot(nowIST);
    
    const screenshot = {
      dataUrl,
      timestamp: now.toISOString(),
      date: now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }), // YYYY-MM-DD format in IST
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }),
      slotStart: timeSlot.slotStart,
      slotEnd: timeSlot.slotEnd,
      slotLabel: timeSlot.slotLabel,
    };

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(screenshot);

      request.onsuccess = () => {
        console.log('Screenshot saved at', screenshot.time, 'Slot:', screenshot.slotLabel);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error saving screenshot:', error);
  }
}

// Start periodic screen capture
export async function startScreenCapture(): Promise<boolean> {
  // Initialize DB
  if (!db) {
    db = await initDB();
  }

  // Clear old screenshots from previous days (keep only today's)
  await clearOldScreenshots();

  // Check if already capturing
  if (captureInterval) {
    return true;
  }

  // Request permission if not already granted
  if (!mediaStream || !mediaStream.active) {
    const granted = await requestScreenPermission();
    if (!granted) {
      return false;
    }
  }

  // Take initial screenshot after 10 seconds delay
  setTimeout(async () => {
    if (mediaStream && mediaStream.active && !isPaused) {
      const initialScreenshot = await captureScreenshot();
      if (initialScreenshot) {
        await saveScreenshot(initialScreenshot);
      }
    }
  }, 10000); // 10 second delay

  // Start periodic capture
  captureInterval = setInterval(async () => {
    if (!mediaStream || !mediaStream.active) {
      stopScreenCapture();
      return;
    }

    // Skip capture if paused (e.g., during lunch break)
    if (isPaused) {
      console.log('Screenshot capture paused (lunch break)');
      return;
    }

    const screenshot = await captureScreenshot();
    if (screenshot) {
      await saveScreenshot(screenshot);
    }
  }, CAPTURE_INTERVAL);

  return true;
}

// Pause screen capture (e.g., during lunch break)
export function pauseScreenCapture(): void {
  isPaused = true;
  console.log('Screen capture paused');
}

// Resume screen capture (e.g., after lunch break)
export function resumeScreenCapture(): void {
  isPaused = false;
  console.log('Screen capture resumed');
}

// Check if screen capture is paused
export function isScreenCapturePaused(): boolean {
  return isPaused;
}

// Stop screen capture
export function stopScreenCapture(): void {
  // Stop the interval
  if (captureInterval) {
    clearInterval(captureInterval);
    captureInterval = null;
  }

  // Stop the media stream
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }
}

// Get all screenshots for today
export async function getTodayScreenshots(): Promise<any[]> {
  try {
    if (!db) {
      db = await initDB();
    }

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD in IST

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('date');
      const request = index.getAll(today);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting screenshots:', error);
    return [];
  }
}

// Get screenshot count for today
export async function getTodayScreenshotCount(): Promise<number> {
  const screenshots = await getTodayScreenshots();
  return screenshots.length;
}

// Clear old screenshots (keep only today's screenshots)
export async function clearOldScreenshots(): Promise<void> {
  try {
    if (!db) {
      db = await initDB();
    }

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD in IST

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('date');
      const request = index.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const screenshot = cursor.value;
          // Delete if not from today
          if (screenshot.date !== today) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          console.log('Old screenshots cleared - only today\'s screenshots remain');
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error clearing old screenshots:', error);
  }
}

// Clear all screenshots (for complete reset)
export async function clearAllScreenshots(): Promise<void> {
  try {
    if (!db) {
      db = await initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('All screenshots cleared');
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error clearing all screenshots:', error);
  }
}

// Export for checking permission status
export function hasScreenPermission(): boolean {
  return mediaStream !== null && mediaStream.active;
}

// Download a single screenshot
export function downloadScreenshot(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Get all screenshots (not just today)
export async function getAllScreenshots(): Promise<any[]> {
  try {
    if (!db) {
      db = await initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting all screenshots:', error);
    return [];
  }
}

// Delete a specific screenshot
export async function deleteScreenshot(id: number): Promise<void> {
  try {
    if (!db) {
      db = await initDB();
    }

    return new Promise((resolve, reject) => {
      const transaction = db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error deleting screenshot:', error);
  }
}

