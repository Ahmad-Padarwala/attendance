/**
 * Timezone utility for IST (Indian Standard Time - UTC+5:30)
 * All date operations in the application should use IST regardless of deployment location
 */

// IST timezone identifier
export const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Get current date and time in IST
 * Returns a Date object representing the current IST time
 */
export function getNowIST(): Date {
  // Get current time in IST using Intl API
  const now = new Date();
  
  // Create a formatter for IST timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(now);
  const dateParts: { [key: string]: string } = {};
  
  parts.forEach(part => {
    if (part.type !== 'literal') {
      dateParts[part.type] = part.value;
    }
  });
  
  // Create a date string in ISO format but representing IST time
  // This Date object will have the IST time values but in local/UTC context
  const istDate = new Date(
    `${dateParts.year}-${dateParts.month}-${dateParts.day}T${dateParts.hour}:${dateParts.minute}:${dateParts.second}.000+05:30`
  );
  
  return istDate;
}

/**
 * Get today's date string in IST (YYYY-MM-DD format)
 */
export function getTodayDateIST(): string {
  const now = new Date();
  
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  const parts = formatter.formatToParts(now);
  const dateParts: { [key: string]: string } = {};
  
  parts.forEach(part => {
    if (part.type !== 'literal') {
      dateParts[part.type] = part.value;
    }
  });
  
  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
}

/**
 * Get today's date as Date object in IST (time set to 00:00:00 UTC for correct date storage)
 * This ensures PostgreSQL DATE type stores the correct IST date
 */
export function getTodayIST(): Date {
  const todayString = getTodayDateIST(); // Gets IST date in YYYY-MM-DD format
  // Create a date at midnight UTC for the IST date
  // This ensures when stored as DATE in PostgreSQL, it has the correct date
  const dateUTC = new Date(todayString + 'T00:00:00.000Z');
  
  console.log('[TIMEZONE] getTodayIST():', {
    todayString,
    dateUTC: dateUTC.toISOString(),
    displayIST: dateUTC.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
    dateComponentUTC: dateUTC.toISOString().split('T')[0]
  });
  
  return dateUTC;
}

/**
 * Convert any date to IST Date object
 */
export function toIST(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(d);
  const dateParts: { [key: string]: string } = {};
  
  parts.forEach(part => {
    if (part.type !== 'literal') {
      dateParts[part.type] = part.value;
    }
  });
  
  return new Date(
    `${dateParts.year}-${dateParts.month}-${dateParts.day}T${dateParts.hour}:${dateParts.minute}:${dateParts.second}.000+05:30`
  );
}

/**
 * Format date to IST string
 */
export function formatDateIST(date: Date | string, includeTime: boolean = false): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (includeTime) {
    return d.toLocaleString('en-US', { 
      timeZone: IST_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }
  
  return d.toLocaleDateString('en-US', { 
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * Get date in YYYY-MM-DD format from any date in IST
 */
export function getDateStringIST(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  const parts = formatter.formatToParts(d);
  const dateParts: { [key: string]: string } = {};
  
  parts.forEach(part => {
    if (part.type !== 'literal') {
      dateParts[part.type] = part.value;
    }
  });
  
  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
}

/**
 * Get start of month in IST
 */
export function getStartOfMonthIST(year: number, month: number): Date {
  // Create date at midnight UTC for first day of month
  const dateString = `${year}-${String(month).padStart(2, '0')}-01`;
  return new Date(dateString + 'T00:00:00.000Z');
}

/**
 * Get end of month in IST
 */
export function getEndOfMonthIST(year: number, month: number): Date {
  // Get the last day of the month
  const lastDay = new Date(year, month, 0).getDate();
  const dateString = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return new Date(dateString + 'T23:59:59.999Z');
}
