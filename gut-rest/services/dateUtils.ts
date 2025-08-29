/**
 * Date utility functions for local date handling
 * Replaces toISOString() usage to ensure local time is used consistently
 */

/**
 * Get local date string in YYYY-MM-DD format
 * @param date - Date object (defaults to current date)
 * @returns Date string in YYYY-MM-DD format using local time
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date string in local time
 * @returns Today's date in YYYY-MM-DD format using local time
 */
export function getTodayDateString(): string {
  return getLocalDateString(new Date());
}

/**
 * Get yesterday's date string in local time
 * @returns Yesterday's date in YYYY-MM-DD format using local time
 */
export function getYesterdayDateString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getLocalDateString(yesterday);
}

/**
 * Get date string from timestamp in local time
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Date string in YYYY-MM-DD format using local time
 */
export function getDateStringFromTimestamp(timestamp: number): string {
  return getLocalDateString(new Date(timestamp));
}

/**
 * Get date string offset by days from a given date in local time
 * @param baseDate - Base date string in YYYY-MM-DD format
 * @param offsetDays - Number of days to offset (positive for future, negative for past)
 * @returns Date string in YYYY-MM-DD format using local time
 */
export function getDateStringWithOffset(
  baseDate: string,
  offsetDays: number
): string {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + offsetDays);
  return getLocalDateString(date);
}

/**
 * Create array of date strings for a date range in local time
 * @param startDate - Start date string in YYYY-MM-DD format
 * @param days - Number of days to include
 * @returns Array of date strings in YYYY-MM-DD format using local time
 */
export function createDateRange(startDate: string, days: number): string[] {
  const dateStrings: string[] = [];
  const start = new Date(startDate);

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    dateStrings.push(getLocalDateString(currentDate));
  }

  return dateStrings;
}

/**
 * Check if a date string represents today in local time
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns True if the date represents today
 */
export function isToday(dateString: string): boolean {
  return dateString === getTodayDateString();
}

/**
 * Check if a date string represents yesterday in local time
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns True if the date represents yesterday
 */
export function isYesterday(dateString: string): boolean {
  return dateString === getYesterdayDateString();
}
