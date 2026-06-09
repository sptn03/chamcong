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
      const response = await axios.get(
        'https://work.hunonicpro.com/v1/users/check_token_cham_cong?token=' + hunonicToken,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: env.hunonic.timeoutMs,
        },
      );

      if (!response.data || response.data.status !== true || !response.data.data) {
        console.error('[Hunonic] Phản hồi lỗi từ Hunonic:', response.data);
        return null;
      }

      const info = response.data.data;
      return {
        sub: String(info.user_id),
        phone: info.phone,
        email: info.email || undefined,
        fullName: info.fullName || undefined,
      };
    } catch (err: any) {
      console.error('[Hunonic] Lỗi xác thực token:', err.response?.data || err.message);
      return null;
    }
  }
}
