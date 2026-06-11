import { Request, Response, NextFunction } from 'express';

/**
 * Hàm wrapper để xử lý bất đồng bộ trong Express route handlers, giúp tránh phải dùng try/catch ở mỗi handler.
 * Sử dụng: asyncHandler(async (req, res) => { ... })
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
