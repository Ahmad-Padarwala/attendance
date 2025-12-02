import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';

export function getMonthDays(date: Date): Date[] {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end });
}

export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'HH:mm');
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
}

export function formatDateDisplay(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
}

export function calculateWorkingHours(startTime: Date, endTime: Date): number {
  const diff = endTime.getTime() - startTime.getTime();
  return parseFloat((diff / (1000 * 60 * 60)).toFixed(2)); // Convert to hours
}

export function calculateDuration(startTime: Date, endTime: Date): number {
  const diff = endTime.getTime() - startTime.getTime();
  return Math.floor(diff / (1000 * 60)); // Convert to minutes
}

// Convert 24-hour time string (e.g., "09:00" or "18:00") to 12-hour format (e.g., "9:00 AM" or "6:00 PM")
export function formatTime12Hour(time24: string): string {
  if (!time24) return '';
  
  const [hourStr, minuteStr] = time24.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr || '00';
  
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12; // Convert 0 to 12 for 12 AM
  
  return `${hour12}:${minute} ${period}`;
}

