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

