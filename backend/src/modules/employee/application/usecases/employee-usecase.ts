import { IEmployeeRepository, IMembershipRepository } from '../../domain/repositories';
import { IUserRepository } from '../../../auth/domain/repositories';
import { CreateEmployeeInput, UpdateEmployeeInput } from '../../domain/entities';
import { EmployeeDto, employeeToDto, CreateEmployeeDto, UpdateEmployeeDto } from '../dto';
import { ValidationError, NotFoundError } from '../../../../shared/errors';

export class EmployeeUsecase {
  constructor(
    private readonly employeeRepo: IEmployeeRepository,
    private readonly userRepo: IUserRepository,
    private readonly membershipRepo: IMembershipRepository,
  ) {}

  async create(input: CreateEmployeeDto): Promise<EmployeeDto> {
    if (!input.companyId || !input.employeeCode || !input.fullName || !input.phone) {
      throw new ValidationError('Vui lòng cung cấp đầy đủ thông tin bắt buộc');
    }

    const existingCode = await this.employeeRepo.findByCode(input.companyId, input.employeeCode);
    if (existingCode) {
      throw new ValidationError('Mã nhân viên đã tồn tại trong công ty này');
    }

    let userId = input.userId;

    if (!userId) {
      // Kiểm tra SĐT trong bảng users
      const existingUser = await this.userRepo.findByPhone(input.phone);
      if (existingUser) {
        userId = existingUser.id;
        
        // Cập nhật email mặc định nếu user đã tồn tại nhưng chưa có email
        const existingEmail = existingUser.email;
        if (!existingEmail) {
          const defaultEmail = `${input.phone}@hunonic.vn`;
          await this.userRepo.update(userId, { email: defaultEmail });
        }
        
        // Kiểm tra xem user này đã là nhân viên của công ty này chưa
        const existingEmp = await this.employeeRepo.findByUserId(userId);
        if (existingEmp.some(e => e.companyId === input.companyId)) {
          throw new ValidationError('Số điện thoại này đã được gán cho nhân viên khác trong công ty');
        }
      } else {
        if (!input.password && !input.isHunonic) {
          throw new ValidationError('Mật khẩu là bắt buộc khi tạo tài khoản mới');
        }
        
        // Gán email mặc định nếu không truyền lên
        const email = input.email || `${input.phone}@hunonic.vn`;

        // Tạo user mới
        const newUser = await this.userRepo.create({
          phone: input.phone,
          email,
          password: input.password || undefined,
          fullName: input.fullName,
          birthday: input.birthday || undefined,
          gender: input.gender as any,
          isHunonic: input.isHunonic || false,
          status: 'active'
        });
        userId = newUser.id;
      }
    }

    // Tạo hồ sơ nhân viên
    const entity = await this.employeeRepo.create({
      userId,
      companyId: input.companyId,
      branchId: input.branchId,
      departmentId: input.departmentId,
      employeeCode: input.employeeCode,
      title: input.title,
    });

    // Thêm company membership
    const existingMem = await this.membershipRepo.findActive(userId, input.companyId);
    if (existingMem) {
      await this.membershipRepo.update(existingMem.id, {
        employeeId: entity.id,
        role: input.role ? (input.role === 1 ? 'admin' : 'employee') : 'employee',
        activeDepartmentId: input.departmentId,
      });
    } else {
      await this.membershipRepo.create({
        userId,
        companyId: input.companyId,
        employeeId: entity.id,
        role: input.role ? (input.role === 1 ? 'admin' : 'employee') : 'employee',
        activeDepartmentId: input.departmentId,
      });
    }

    // entity từ repo.create() đã là đầy đủ (repo tự gọi findById sau INSERT)
    return employeeToDto(entity);
  }

  async getById(id: number): Promise<EmployeeDto> {
    const entity = await this.employeeRepo.findById(id);
    if (!entity) throw new NotFoundError('Không tìm thấy thông tin nhân viên');
    return employeeToDto(entity);
  }

  async getByCompany(companyId: number): Promise<EmployeeDto[]> {
    const entities = await this.employeeRepo.findByCompanyId(companyId);
    return entities.map(employeeToDto);
  }

  async update(id: number, input: UpdateEmployeeDto): Promise<EmployeeDto> {
    const existing = await this.employeeRepo.findById(id);
    if (!existing) throw new NotFoundError('Không tìm thấy thông tin nhân viên');

    // Cập nhật employees — kết quả trả về đã là entity đầy đủ (repo tự gọi findById sau UPDATE)
    const entity = await this.employeeRepo.update(id, {
      branchId: input.branchId,
      departmentId: input.departmentId,
      title: input.title,
      status: input.status as any,
    });

    // Cập nhật users
    const user = await this.userRepo.findById(existing.userId);
    if (!user) throw new NotFoundError('Tài khoản không tồn tại');
    const currentPhone = user.phone || '';
    const currentEmail = user.email || '';

    let finalEmail = input.email;
    const newPhone = input.phone;

    // Nếu thay đổi số điện thoại, và email hiện tại đang trống hoặc là email mặc định cũ, hãy tự động đồng bộ email mặc định mới
    if (newPhone !== undefined && newPhone !== currentPhone) {
      const isOldDefault = !currentEmail || currentEmail === `${currentPhone}@hunonic.vn`;
      if (isOldDefault && !input.email) {
        finalEmail = `${newPhone}@hunonic.vn`;
      }
    }

    // Nếu email được truyền lên nhưng là chuỗi trống
    if (finalEmail === '') {
      finalEmail = `${newPhone || currentPhone}@hunonic.vn`;
    }

    await this.userRepo.update(existing.userId, {
      fullName: input.fullName,
      phone: input.phone,
      email: finalEmail,
      birthday: input.birthday,
      gender: input.gender as any,
      isHunonic: input.isHunonic,
      password: input.password,
    });

    // Cập nhật company_memberships
    if (input.role !== undefined || input.departmentId !== undefined) {
      const existingMem = await this.membershipRepo.findActive(existing.userId, existing.companyId);
      if (existingMem) {
        await this.membershipRepo.update(existingMem.id, {
          role: input.role ? (input.role === 1 ? 'admin' : 'employee') : undefined,
          activeDepartmentId: input.departmentId,
        });
      }
    }

    return employeeToDto(entity);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.employeeRepo.findById(id);
    if (!existing) throw new NotFoundError('Không tìm thấy thông tin nhân viên');
    await this.employeeRepo.softDelete(id);
  }
}
