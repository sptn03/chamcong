/**
 * Format số thành chuỗi có dấu chấm chấm
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return num.toLocaleString('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format số thành chuỗi tiền tệ Việt Nam (VND)
 */
export function formatCurrency(num: number): string {
  return num.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });
}

/**
 * Cắt chuỗi thành độ dài tối đa
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}
