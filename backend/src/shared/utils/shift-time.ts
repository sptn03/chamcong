import moment from 'moment';

/**
 * Parse interval value từ Postgres (string 'HH:MM:SS' hoặc object {hours, minutes, seconds})
 * và tạo moment từ workDate + interval.
 */
export function getMomentFromInterval(workDate: string, intervalValue: string | Record<string, number>): moment.Moment {
  let hours = 0, minutes = 0, seconds = 0;

  if (typeof intervalValue === 'string') {
    const parts = intervalValue.split(':');
    hours = parseInt(parts[0] || '0', 10);
    minutes = parseInt(parts[1] || '0', 10);
    seconds = parseInt(parts[2] || '0', 10);
  } else if (intervalValue && typeof intervalValue === 'object') {
    hours = (intervalValue as any).hours || 0;
    minutes = (intervalValue as any).minutes || 0;
    seconds = (intervalValue as any).seconds || 0;
  }

  return moment(workDate, 'YYYY-MM-DD')
    .utcOffset('+07:00')
    .startOf('day')
    .add(hours, 'hours')
    .add(minutes, 'minutes')
    .add(seconds, 'seconds');
}

/**
 * Tính thời gian ca (phút) dựa trên startTime và endTime của ca.
 * Xử lý trường hợp ca qua nửa đêm (endTime < startTime).
 */
export function getShiftDurationMinutes(
  workDate: string,
  startTime: string | Record<string, number>,
  endTime: string | Record<string, number>,
): number {
  const start = getMomentFromInterval(workDate, startTime);
  let end = getMomentFromInterval(workDate, endTime);
  if (end.isSameOrBefore(start)) {
    end = end.add(1, 'day');
  }
  return Math.max(0, end.diff(start, 'minutes'));
}

/**
 * Tính workCredit theo tỷ lệ thực tế:
 *   workCredit = round(actualWorkMinutes / shiftDurationMinutes * shift.workCredit, 2)
 * Giới hạn tối đa = shift.workCredit (không tính dư khi làm thêm giờ).
 */
export function calculateWorkCredit(
  actualWorkMinutes: number,
  shiftDurationMinutes: number,
  shiftWorkCredit: number,
): number {
  if (shiftDurationMinutes <= 0) return shiftWorkCredit;
  const ratio = actualWorkMinutes / shiftDurationMinutes;
  const computed = ratio * shiftWorkCredit;
  return Math.round(Math.min(computed, shiftWorkCredit) * 100) / 100;
}
