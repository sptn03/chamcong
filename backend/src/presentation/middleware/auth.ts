import { Request, Response, NextFunction } from 'express';
import { ITokenRepository } from '../../modules/attendance/domain/repositories';
import { error as errorResponse } from '../helpers/response';

// Mở rộng Request để gắn userId sau khi auth thành công
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

/**
 * Middleware kiểm tra token.
 * Token được lấy từ body hoặc query param:
 *   - Body:  { token: '...' }
 *   - Query: ?token=...
 *
 * Nếu hợp lệ, gắn userId vào req.userId và gọi next().
 * Nếu không, trả về 401.
 * Api login và health check không cần qua middleware này.
 */
export function createAuthMiddleware(tokenRepo: ITokenRepository) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.body?.token || (req.query?.token as string | undefined);

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
      next();
    } catch (err) {
      console.error('[AuthMiddleware] Lỗi:', (err as Error).message);
      res.status(500).json(errorResponse('Lỗi xác thực'));
    }
  };
}
