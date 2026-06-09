import { Pool } from 'pg';
import { ITokenRepository } from '../../domain/repositories';
import { LoginDto, HunonicLoginDto, TokenDto, LogoutDto } from '../dto';
import { ValidationError, UnauthorizedError } from '../../../../shared/errors';
import { HunonicService } from '../../../../infrastructure/services/HunonicService';
import { v4 as uuidv4 } from 'uuid';

export class AuthUsecase {
  constructor(
    private readonly tokenRepo: ITokenRepository,
    private readonly pool: Pool,
    private readonly hunonicService: HunonicService,
  ) {}

  /** Đăng nhập bằng phone + password (cho user thường) */
  async login(input: LoginDto): Promise<{
    token: string;
    userId: number;
    deviceId: number | null;
    createdAt: string;
    user: { id: number; phone: string; fullName: string; role: string };
  }> {
    if (!input.phone || !input.password) {
      throw new ValidationError('Số điện thoại và mật khẩu là bắt buộc');
    }

    // Tìm user theo phone
    const userResult = await this.pool.query(
      'SELECT id, pass, full_name, status, is_hunonic FROM users WHERE phone = $1',
      [input.phone],
    );

    if (!userResult.rows.length) {
      throw new UnauthorizedError('Sai số điện thoại hoặc mật khẩu');
    }

    const user = userResult.rows[0];

    if (user.is_hunonic) {
      throw new UnauthorizedError('Tài khoản này sử dụng đăng nhập qua Hunonic');
    }

    if (user.status === 'locked') {
      throw new UnauthorizedError('Tài khoản đã bị khóa');
    }

    // Kiểm tra mật khẩu dùng pgcrypto
    const pwResult = await this.pool.query(
      'SELECT crypt($1, pass) = pass AS valid FROM users WHERE id = $2',
      [input.password, user.id],
    );

    if (!pwResult.rows[0]?.valid) {
      throw new UnauthorizedError('Sai số điện thoại hoặc mật khẩu');
    }

    // Đăng ký / cập nhật thiết bị
    const deviceId = await this.registerOrUpdateDevice(user.id, input);

    // Tạo token
    const session = await this.createSessionToken(user.id, deviceId);

    // Lấy role từ company_memberships
    const memResult = await this.pool.query(
      "SELECT role FROM company_memberships WHERE user_id = $1 AND deleted_at IS NULL LIMIT 1",
      [user.id],
    );

    return {
      ...session,
      user: {
        id: user.id,
        phone: input.phone,
        fullName: user.full_name,
        role: memResult.rows.length > 0 ? memResult.rows[0].role : 'employee',
      },
    };
  }

  /** Đăng nhập qua Hunonic (cho user có is_hunonic = true) */
  async hunonicLogin(input: HunonicLoginDto): Promise<TokenDto> {
    if (!input.hunonicToken) {
      throw new ValidationError('Token Hunonic là bắt buộc');
    }

    // Xác thực token với Hunonic
    const hunonicUser = await this.hunonicService.verifyToken(input.hunonicToken);
    if (!hunonicUser) {
      throw new UnauthorizedError('Token Hunonic không hợp lệ');
    }

    let userResult;

    // Tìm user bằng phone trước (với is_hunonic = true)
    if (hunonicUser.phone) {
      userResult = await this.pool.query(
        'SELECT id, status, is_hunonic FROM users WHERE phone = $1 AND is_hunonic = TRUE',
        [hunonicUser.phone],
      );
    }

    // Nếu không tìm thấy theo phone, tìm theo email (với is_hunonic = true)
    if ((!userResult || !userResult.rows.length) && hunonicUser.email) {
      userResult = await this.pool.query(
        'SELECT id, status, is_hunonic FROM users WHERE email = $1 AND is_hunonic = TRUE',
        [hunonicUser.email],
      );
    }

    // Nếu không tìm thấy user nào, báo lỗi
    if (!userResult || !userResult.rows.length) {
      throw new UnauthorizedError('Tài khoản chưa được cấu hình đăng nhập Hunonic');
    }

    const user = userResult.rows[0];

    if (user.status === 'locked') {
      throw new UnauthorizedError('Tài khoản đã bị khóa');
    }

    // Đăng ký / cập nhật thiết bị
    const deviceId = await this.registerOrUpdateDevice(user.id, input);

    // Tái sử dụng hoặc tạo session token bằng chính hunonicToken
    return this.getOrCreateHunonicSessionToken(user.id, deviceId, input.hunonicToken);
  }

  /** Đăng xuất, vô hiệu token */
  async logout(input: LogoutDto): Promise<void> {
    const tokenEntity = await this.tokenRepo.findByToken(input.token);
    if (!tokenEntity) throw new UnauthorizedError('Token không hợp lệ');
    await this.tokenRepo.deactivate(tokenEntity.id);
  }

  /** Chọn/Chuyển đổi Công ty hoạt động */
  async switchCompany(tokenId: number, userId: number, companyId: number): Promise<{ activeCompanyId: number; activeEmployeeId: number }> {
    if (!companyId) {
      throw new ValidationError('companyId là bắt buộc');
    }

    const employeeResult = await this.pool.query(
      'SELECT id FROM employees WHERE user_id = $1 AND company_id = $2 AND deleted_at IS NULL AND status = \'active\'',
      [userId, companyId],
    );

    if (!employeeResult.rows.length) {
      throw new ValidationError('Người dùng không có hồ sơ nhân viên hoạt động trong công ty này');
    }

    const employeeId = Number(employeeResult.rows[0].id);
    await this.tokenRepo.updateActiveContext(tokenId, companyId, employeeId);

    return {
      activeCompanyId: companyId,
      activeEmployeeId: employeeId,
    };
  }

  /** Kiểm tra token còn hiệu lực không */
  async validateToken(token: string): Promise<{ userId: number } | null> {
    const tokenEntity = await this.tokenRepo.findByToken(token);
    if (!tokenEntity) return null;
    return { userId: tokenEntity.userId };
  }

  // --- Private helpers ---

  /** Đăng ký hoặc cập nhật thiết bị, trả về deviceId */
  private async registerOrUpdateDevice(userId: number, input: any): Promise<number | null> {
    if (!input.deviceUid || !input.platform) return null;

    const existingDevice = await this.pool.query(
      'SELECT id FROM devices WHERE user_id = $1 AND device_uid = $2',
      [userId, input.deviceUid],
    );

    if (existingDevice.rows.length) {
      const deviceId = existingDevice.rows[0].id;
      await this.pool.query('UPDATE devices SET last_login_at = NOW() WHERE id = $1', [deviceId]);
      return deviceId;
    }

    const newDevice = await this.pool.query(
      `INSERT INTO devices (user_id, device_uid, device_name, platform, os_version, app_version, last_login_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id`,
      [userId, input.deviceUid, input.deviceName ?? null, input.platform,
       input.osVersion ?? null, input.appVersion ?? null],
    );
    return newDevice.rows[0].id;
  }

  /** Tạo hoặc lấy session token cho Hunonic bằng chính token Hunonic */
  private async getOrCreateHunonicSessionToken(userId: number, deviceId: number | null, token: string): Promise<TokenDto> {
    const existing = await this.tokenRepo.findByToken(token, true);

    let entity;
    if (existing) {
      entity = await this.tokenRepo.reactivate(existing.id, userId, deviceId);
    } else {
      entity = await this.tokenRepo.create({
        userId,
        deviceId: deviceId ?? undefined,
        token,
      });
    }

    return {
      token: entity.token,
      userId: entity.userId,
      deviceId: entity.deviceId,
      createdAt: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : new Date(entity.createdAt).toISOString(),
    };
  }

  /** Tạo session token mới */
  private async createSessionToken(userId: number, deviceId: number | null): Promise<TokenDto> {
    const token = uuidv4();
    const entity = await this.tokenRepo.create({
      userId,
      deviceId: deviceId ?? undefined,
      token,
    });

    return {
      token: entity.token,
      userId: entity.userId,
      deviceId: entity.deviceId,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
