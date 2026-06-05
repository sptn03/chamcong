import { Request, Response } from 'express';
import { AuthUsecase } from '../../modules/attendance/application/usecases';
import { asyncHandler } from '../helpers/async-handler';
import { ok } from '../helpers/response';

/**
 * Controller xử lý đăng nhập / đăng xuất
 * Api login KHÔNG cần auth middleware
 */
export class AuthController {
  constructor(private readonly authUsecase: AuthUsecase) {}

  /** POST /api/auth/login - Đăng nhập bằng phone + password */
  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authUsecase.login(req.body);
    res.json(ok(result, 'Đăng nhập thành công'));
  });

  /** POST /api/auth/hunonic-login - Đăng nhập qua Hunonic */
  hunonicLogin = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authUsecase.hunonicLogin(req.body);
    res.json(ok(result, 'Đăng nhập Hunonic thành công'));
  });

  /** POST /api/auth/logout - Đăng xuất, vô hiệu token */
  logout = asyncHandler(async (req: Request, res: Response) => {
    const token = req.body?.token || (req.query?.token as string | undefined);
    if (!token) {
      res.json(ok(null, 'Đã đăng xuất'));
      return;
    }
    await this.authUsecase.logout({ token });
    res.json(ok(null, 'Đã đăng xuất'));
  });
}
