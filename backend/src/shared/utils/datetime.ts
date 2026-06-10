import moment from 'moment';

/**
 * Format thời gian về GMT+7 và trả về chuỗi định dạng 'YYYY-MM-DD HH:mm:ss'
 */
export function formatToGMT7(date: Date | string | number): string {
  return moment(date).utcOffset('+07:00').format('YYYY-MM-DD HH:mm:ss');
}

/**
 * Format chuỗi thời gian thành chuỗi SQL compatible (YYYY-MM-DD HH:mm:ss)
 */
export function formatDateTimeSql(date: Date = new Date()): string {
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * string chuỗi ngày gian Việt Nam trong GMT+7 (YYYY-MM-DD)
 */
export function getVnDateStr(date: Date = new Date()): string {
  return moment(date).utcOffset('+07:00').format('YYYY-MM-DD');
}

/**
 * Lấy thời gian hiện tại trong GMT+7
 */
export function getVnNow(): Date {
  return moment().utcOffset('+07:00').toDate();
}

/**
 * Chuyển Date thành ISO string có timezone +07:00
 * Ví dụ: 2026-06-10T13:55:00+07:00
 */
export function toVNTime(date: Date): string {
  return moment(date).utcOffset('+07:00').format('YYYY-MM-DDTHH:mm:ssZ');
}

/**
 * Chuyển Date | null thành ISO string có timezone +07:00, hoặc null
 */
export function toVNTimeNullable(date: Date | null | undefined): string | null {
  if (!date) return null;
  return toVNTime(date);
}

