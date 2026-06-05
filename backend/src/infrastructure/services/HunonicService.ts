import axios from 'axios';
import { env } from '../../infrastructure/database/env';

export interface HunonicUserInfo {
  sub: string;         // Hunonic user ID
  phone: string;       // Số điện thoại từ Hunonic
  email?: string;      // Email từ Hunonic
  fullName?: string;   // Họ tên (nếu có)
}

/**
 * Service gọi API Hunonic để xác thực token.
 * Hunonic là hệ thống xác thực bên ngoài, trả về thông tin user sau khi verify token.
 */
export class HunonicService {
  /**
   * Xác thực token từ Hunonic.
   * Gọi API Hunonic để verify token và lấy thông tin user.
   * Trả về thông tin user nếu token hợp lệ, null nếu không.
   */
  async verifyToken(hunonicToken: string): Promise<HunonicUserInfo | null> {
    try {
      const response = await axios.post(
        env.hunonic.verifyUrl,
        { token: hunonicToken },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': env.hunonic.apiKey,
          },
          timeout: env.hunonic.timeoutMs,
        },
      );

      if (!response.data?.sub || !response.data?.phone) {
        console.error('[Hunonic] Response thiếu sub hoặc phone:', response.data);
        return null;
      }

      return {
        sub: response.data.sub,
        phone: response.data.phone,
        email: response.data.email || undefined,
        fullName: response.data.full_name || undefined,
      };
    } catch (err: any) {
      console.error('[Hunonic] Lỗi xác thực token:', err.response?.data || err.message);
      return null;
    }
  }
}
