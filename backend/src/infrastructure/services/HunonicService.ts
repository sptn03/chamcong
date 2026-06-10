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
export interface HunonicPasswordLoginResult {
  id: string;
  active: string;
  name: string;
  phone: string;
  email: string | null;
  avatar: string | null;
  tokenId: string;
  gender: number | null; // 1 = nam, 2 = nữ hoặc không xác định
}

export class HunonicService {
  /**
   * Xác thực token từ Hunonic.
   * Gọi API Hunonic để verify token và lấy thông tin user.
   * Trả về thông tin user nếu token hợp lệ, null nếu không.
   */
  async verifyToken(hunonicToken: string): Promise<HunonicUserInfo | null> {
    try {
      const response = await axios.get(
        'https://work.hunonicpro.com/v1/users/check_token_time_keep?token=' + hunonicToken,
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

  /**
   * Đăng nhập vào Hunonic bằng phone + mật khẩu.
   * API này trả về token_id để dùng cho các request sau.
   */
  async loginWithPassword(phone: string, password: string): Promise<HunonicPasswordLoginResult | null> {
    try {
      const response = await axios.post(
        'https://work.hunonicpro.com/v1/Signin/auth_time_keep',
        new URLSearchParams({ phone, password }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: env.hunonic.timeoutMs,
        },
      );

      if (!response.data || response.data.status !== true || !response.data.data?.token_id) {
        console.error('[Hunonic] Phản hồi lỗi từ Hunonic:', response.data);
        return null;
      }

      const data = response.data.data;
      return {
        id: String(data.id),
        active: String(data.active),
        name: data.name,
        phone: data.phone,
        email: data.email ?? null,
        avatar: data.avatar ?? null,
        tokenId: data.token_id,
        gender: data.sex ? 1 : null,
      };
    } catch (err: any) {
      console.error('[Hunonic] Lỗi đăng nhập:', err.response?.data || err.message);
      return null;
    }
  }
}
