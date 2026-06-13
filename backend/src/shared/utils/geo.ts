/**
 * Tính khoảng cách giữa 2 điểm GPS (lat/lng) theo công thức Haversine, trả về kết quả bằng mét
 */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Kiểm tra xem tọa độ (lat, lng) có nằm trong bán kính cho phép của location không
 */
export function isWithinRadius(
  lat: number,
  lng: number,
  locationLat: number,
  locationLng: number,
  radiusM: number,
): boolean {
  return haversineDistance(lat, lng, locationLat, locationLng) <= radiusM;
}
