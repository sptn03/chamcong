/**
 * Format a number with thousand separators.
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return num.toLocaleString('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a number as Vietnamese currency (VND).
 */
export function formatCurrency(num: number): string {
  return num.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });
}

/**
 * Truncate a string to a maximum length.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}
