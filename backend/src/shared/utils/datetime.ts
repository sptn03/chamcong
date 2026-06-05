import moment from 'moment';

/**
 * Format a Date/timestamp to GMT+7 string.
 */
export function formatToGMT7(date: Date | string | number): string {
  return moment(date).utcOffset('+07:00').format('YYYY-MM-DD HH:mm:ss');
}

/**
 * Format a Date to SQL-compatible datetime string (YYYY-MM-DD HH:mm:ss).
 */
export function formatDateTimeSql(date: Date = new Date()): string {
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * Get Vietnam date string (YYYY-MM-DD) in GMT+7.
 */
export function getVnDateStr(date: Date = new Date()): string {
  return moment(date).utcOffset('+07:00').format('YYYY-MM-DD');
}

/**
 * Get current time in GMT+7 as a Date object.
 */
export function getVnNow(): Date {
  return moment().utcOffset('+07:00').toDate();
}
