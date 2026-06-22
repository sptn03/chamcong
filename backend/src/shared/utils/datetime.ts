import moment from 'moment';

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
 * Chuyển Date thành chuỗi thời gian sạch có timezone +07:00 người dùng đọc được
 * Ví dụ: 2026-06-10 13:55:00
 */
export function toVNTime(date: Date): string {
  return moment(date).utcOffset('+07:00').format('YYYY-MM-DD HH:mm:ss');
}

/**
 * Chuyển Date | null thành chuỗi thời gian sạch có timezone +07:00, hoặc null
 */
export function toVNTimeNullable(date: Date | null | undefined): string | null {
  if (!date) return null;
  return toVNTime(date);
}

