import { Request, Response, NextFunction } from 'express';
import { ITokenRepository } from '../../modules/attendance/domain/repositories';
import { error as errorResponse } from '../helpers/response';

// Mở rộng Request để gắn userId và context sau khi auth thành công
declare global {
  namespace Express {
    interface Request {
      userId?: number;
      tokenId?: number;
      deviceId?: number | null;
      activeCompanyId?: number | null;
      activeEmployeeId?: number | null;
      tokenString?: string;
    }
  }
}

/**
 * Middleware kiểm tra token.
 * Token được lấy từ:
 *   - Authorization Header: Bearer <token>
 *   - Body:  { token: '...' }
 *   - Query: ?token=...
 *
 * Nếu hợp lệ, gắn userId và active context vào req và gọi next().
 * Nếu không, trả về 401.
 */
export function createAuthMiddleware(tokenRepo: ITokenRepository) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let token = req.body?.token || (req.query?.token as string | undefined);

      const authHeader = req.headers.authorization;
      if (!token && authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }

      if (!token) {
        res.status(401).json(errorResponse('Thiếu token xác thực'));
        return;
      }

      const tokenEntity = await tokenRepo.findByToken(token);

      if (!tokenEntity || !tokenEntity.active) {
        res.status(401).json(errorResponse('Token không hợp lệ hoặc đã hết hạn'));
        return;
      }

      req.userId = tokenEntity.userId;
      req.tokenId = tokenEntity.id;
      req.deviceId = tokenEntity.deviceId;
      req.activeCompanyId = tokenEntity.activeCompanyId;
      req.activeEmployeeId = tokenEntity.activeEmployeeId;
      req.tokenString = tokenEntity.token;
      next();
    } catch (err) {
      console.error('[AuthMiddleware] Lỗi:', (err as Error).message);
      res.status(500).json(errorResponse('Lỗi xác thực'));
    }
  };
}
