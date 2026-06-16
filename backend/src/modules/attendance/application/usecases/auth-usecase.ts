import { ITokenRepository, IUserRepository, IDeviceRepository, IMembershipRepository, IEmployeeRepository } from '../../domain/repositories';
import { LoginDto, HunonicLoginDto, HunonicPasswordLoginDto, TokenDto, LogoutDto } from '../dto';
import { ValidationError, UnauthorizedError } from '../../../../shared/errors';
import { HunonicService } from '../../../../infrastructure/services/HunonicService';
import { toVNTime } from '../../../../shared/utils/datetime';
import { v4 as uuidv4 } from 'uuid';

export class AuthUsecase {
  constructor(
    private readonly tokenRepo: ITokenRepository,
    private readonly userRepo: IUserRepository,
    private readonly deviceRepo: IDeviceRepository,
    private readonly membershipRepo: IMembershipRepository,
    private readonly employeeRepo: IEmployeeRepository,
    private readonly hunonicService: HunonicService,
  ) {}

  /** Đăng nhập bằng phone + password (cho user thường) */
  async login(input: LoginDto): Promise<{
    token: string;
    userId: number;
    deviceId: number | null;
    createdAt: string;
    user: { id: number; phone: string; fullName: string; role: string; email?: string | null };
  }> {
    if (!input.phone || !input.password) {
      throw new ValidationError('Số điện thoại và mật khẩu là bắt buộc');
    }

    // Tìm user theo phone
    const user = await this.userRepo.findByPhone(input.phone);
    if (!user) {
      throw new UnauthorizedError('Sai số điện thoại hoặc mật khẩu');
    }

    if (user.isHunonic) {
      throw new UnauthorizedError('Tài khoản này sử dụng đăng nhập qua Hunonic');
    }

    if (user.status === 'locked') {
      throw new UnauthorizedError('Tài khoản đã bị khóa');
    }

    // Kiểm tra mật khẩu dùng pgcrypto
    const isValid = await this.userRepo.verifyPassword(user.id, input.password);
    if (!isValid) {
      throw new UnauthorizedError('Sai số điện thoại hoặc mật khẩu');
    }

    // Đăng ký / cập nhật thiết bị
    const deviceId = await this.registerOrUpdateDevice(user.id, input);

    // Kiểm tra role để quyết định multi-session
    const activeMemberships = await this.membershipRepo.findByUserId(user.id);
    const role = activeMemberships.length > 0 ? activeMemberships[0].role : 'employee';
    const isAdmin = role === 'admin';

    // Tạo token
    const session = await this.createSessionToken(user.id, deviceId, !isAdmin);

    return {
      ...session,
      user: {
        id: user.id,
        phone: input.phone,
        fullName: user.fullName,
        email: user.email,
        role,
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

    const user = await this.userRepo.findHunonicUserByPhoneOrEmail(hunonicUser.phone, hunonicUser.email);

    // Nếu không tìm thấy user nào, báo lỗi
    if (!user) {
      throw new UnauthorizedError('Tài khoản chưa được cấu hình đăng nhập Hunonic');
    }

    if (user.status === 'locked') {
      throw new UnauthorizedError('Tài khoản đã bị khóa');
    }

    // Đăng ký / cập nhật thiết bị
    const deviceId = await this.registerOrUpdateDevice(user.id, input);

    // Kiểm tra role — admin được multi-session
    const activeMemberships = await this.membershipRepo.findByUserId(user.id);
    const isAdmin = activeMemberships.length > 0 && activeMemberships[0].role === 'admin';

    // Tái sử dụng hoặc tạo session token bằng chính hunonicToken
    return this.getOrCreateHunonicSessionToken(user.id, deviceId, input.hunonicToken, !isAdmin);
  }

  /** Đăng nhập qua Hunonic bằng phone + mật khẩu (không cần token trước) */
  async hunonicPasswordLogin(input: HunonicPasswordLoginDto): Promise<TokenDto & {
    user: { id: number; phone: string; fullName: string; role: string; email?: string | null };
  }> {
    if (!input.phone || !input.password) {
      throw new ValidationError('Số điện thoại và mật khẩu là bắt buộc');
    }

    // Gọi API Hunonic để xác thực phone + password
    const hunonicResult = await this.hunonicService.loginWithPassword(input.phone, input.password);
    if (!hunonicResult) {
      throw new UnauthorizedError('Sai số điện thoại hoặc mật khẩu Hunonic');
    }

    // Dùng token_id từ Hunonic làm session token
    const hunonicToken = hunonicResult.tokenId;

    // Tìm user trong DB, nếu chưa có thì tạo mới
    let user = await this.userRepo.findByPhone(input.phone);

    if (!user) {
      // Tạo user mới từ thông tin Hunonic (nếu trống email thì lấy sđt@hunonic.vn)
      const email = hunonicResult.email || `${hunonicResult.phone}@hunonic.vn`;
      user = await this.userRepo.create({
        phone: hunonicResult.phone,
        email,
        fullName: hunonicResult.name,
        isHunonic: true,
        gender: hunonicResult.gender ? 'male' : 'other',
        status: 'active',
      });
    } else {
      if (user.status === 'locked') {
        throw new UnauthorizedError('Tài khoản đã bị khóa');
      }
      // Cập nhật thông tin user từ Hunonic (đồng bộ)
      user = await this.userRepo.update(user.id, {
        isHunonic: true,
        fullName: hunonicResult.name,
      });
    }

    // Đăng ký / cập nhật thiết bị
    const deviceId = await this.registerOrUpdateDevice(user.id, input);

    // Kiểm tra role — admin được multi-session
    const activeMemberships = await this.membershipRepo.findByUserId(user.id);
    const isAdmin = activeMemberships.length > 0 && activeMemberships[0].role === 'admin';
    const role = activeMemberships.length > 0 ? activeMemberships[0].role : 'employee';

    // Tái sử dụng hoặc tạo session token bằng chính hunonicToken
    const session = await this.getOrCreateHunonicSessionToken(user.id, deviceId, hunonicToken, !isAdmin);

    return {
      ...session,
      user: {
        id: user.id,
        phone: input.phone,
        fullName: user.fullName,
        email: user.email,
        role,
      },
    };
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

    const employees = await this.employeeRepo.findByUserId(userId);
    const activeEmployee = employees.find(e => e.companyId === companyId && e.status === 'active');

    if (!activeEmployee) {
      throw new ValidationError('Người dùng không có hồ sơ nhân viên hoạt động trong công ty này');
    }

    const employeeId = activeEmployee.id;
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

    // Chuẩn hóa platform về chữ thường để khớp với PLATFORM_DB
    input.platform = input.platform.toLowerCase();

    // Kiểm tra user đã có device approved nào chưa
    const approvedCount = await this.deviceRepo.countApprovedDevices(userId);
    const existingDevice = await this.deviceRepo.findByUid(userId, input.deviceUid);

    if (existingDevice) {
      const deviceId = existingDevice.id;
      const status = existingDevice.status;

      if (status !== 'approved') {
        // Cập nhật lại thông tin thiết bị và chuyển trạng thái về pending nếu nó đang ở trạng thái khác approved
        await this.deviceRepo.updateDeviceDetails(deviceId, {
          status: 'pending',
          deviceName: input.deviceName,
          platform: input.platform,
          osVersion: input.osVersion,
          appVersion: input.appVersion,
        });
        throw new UnauthorizedError('Thiết bị chưa được xác thực. Vui lòng đợi Admin duyệt.');
      }

      await this.deviceRepo.updateLastLogin(deviceId);
      return deviceId;
    }

    // Device mới: kiểm tra nếu là device đầu tiên thì auto-approve
    const isFirstDevice = approvedCount === 0;
    const status = isFirstDevice ? 'approved' : 'pending';

    const newDevice = await this.deviceRepo.create({
      userId,
      deviceUid: input.deviceUid,
      deviceName: input.deviceName,
      platform: input.platform,
      osVersion: input.osVersion,
      appVersion: input.appVersion,
    });

    if (isFirstDevice) {
      await this.deviceRepo.updateStatus(newDevice.id, 'approved');
    }

    if (!isFirstDevice) {
      throw new UnauthorizedError('Thiết bị mới cần được Admin duyệt trước khi sử dụng.');
    }

    return newDevice.id;
  }

  /** Tạo hoặc lấy session token cho Hunonic bằng chính token Hunonic */
  private async getOrCreateHunonicSessionToken(userId: number, deviceId: number | null, token: string, deactivateOthers = true): Promise<TokenDto> {
    if (deactivateOthers) {
      await this.tokenRepo.deactivateAllForUser(userId);
    }

    const existing = await this.tokenRepo.findByToken(token, true);

    // Tự động gán công ty nếu người dùng chỉ thuộc về duy nhất 1 công ty hoạt động
    const employees = await this.employeeRepo.findByUserId(userId);
    const activeEmployees = employees.filter(e => e.status === 'active');

    let activeCompanyId: number | null = null;
    let activeEmployeeId: number | null = null;

    if (activeEmployees.length === 1) {
      activeCompanyId = activeEmployees[0].companyId;
      activeEmployeeId = activeEmployees[0].id;
    }

    let entity;
    if (existing) {
      entity = await this.tokenRepo.reactivate(existing.id, userId, deviceId);
      if (activeCompanyId && activeEmployeeId) {
        await this.tokenRepo.updateActiveContext(existing.id, activeCompanyId, activeEmployeeId);
        entity.activeCompanyId = activeCompanyId;
        entity.activeEmployeeId = activeEmployeeId;
      }
    } else {
      entity = await this.tokenRepo.create({
        userId,
        deviceId: deviceId ?? undefined,
        token,
        activeCompanyId: activeCompanyId ?? undefined,
        activeEmployeeId: activeEmployeeId ?? undefined,
      });
    }

    return {
      token: entity.token,
      userId: entity.userId,
      deviceId: entity.deviceId,
      createdAt: toVNTime(entity.createdAt instanceof Date ? entity.createdAt : new Date(entity.createdAt)),
      activeCompanyId: entity.activeCompanyId,
      activeEmployeeId: entity.activeEmployeeId,
    };
  }

  /** Tạo session token mới, admin được multi-session */
  private async createSessionToken(userId: number, deviceId: number | null, deactivateOthers = true): Promise<TokenDto> {
    if (deactivateOthers) {
      await this.tokenRepo.deactivateAllForUser(userId);
    }

    // Tự động gán công ty nếu người dùng chỉ thuộc về duy nhất 1 công ty hoạt động
    const employees = await this.employeeRepo.findByUserId(userId);
    const activeEmployees = employees.filter(e => e.status === 'active');

    let activeCompanyId: number | undefined = undefined;
    let activeEmployeeId: number | undefined = undefined;

    if (activeEmployees.length === 1) {
      activeCompanyId = activeEmployees[0].companyId;
      activeEmployeeId = activeEmployees[0].id;
    }

    const token = uuidv4();
    const entity = await this.tokenRepo.create({
      userId,
      deviceId: deviceId ?? undefined,
      token,
      activeCompanyId,
      activeEmployeeId,
    });

    return {
      token: entity.token,
      userId: entity.userId,
      deviceId: entity.deviceId,
      createdAt: toVNTime(entity.createdAt),
      activeCompanyId: entity.activeCompanyId,
      activeEmployeeId: entity.activeEmployeeId,
    };
  }
}
