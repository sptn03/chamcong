import { Pool } from 'pg';
import { IEmployeeRepository } from '../../domain/repositories';
import { CreateEmployeeInput, UpdateEmployeeInput } from '../../domain/entities';
import { EmployeeDto, employeeToDto, CreateEmployeeDto, UpdateEmployeeDto } from '../dto';
import { ValidationError, NotFoundError } from '../../../../shared/errors';

export class EmployeeUsecase {
  constructor(
    private readonly employeeRepo: IEmployeeRepository,
    private readonly pool: Pool,
  ) {}

  async create(input: CreateEmployeeDto): Promise<EmployeeDto> {
    if (!input.companyId || !input.employeeCode || !input.fullName || !input.phone) {
      throw new ValidationError('Missing required fields (companyId, employeeCode, fullName, phone)');
    }

    const existingCode = await this.employeeRepo.findByCode(input.companyId, input.employeeCode);
    if (existingCode) {
      throw new ValidationError('Mã nhân viên đã tồn tại trong công ty này');
    }

    let userId = input.userId;

    if (!userId) {
      // Kiểm tra SĐT trong bảng users
      const existingUser = await this.pool.query('SELECT id FROM users WHERE phone = $1', [input.phone]);
      if (existingUser.rows.length > 0) {
        userId = Number(existingUser.rows[0].id);
        
        // Kiểm tra xem user này đã là nhân viên của công ty này chưa
        const existingEmp = await this.employeeRepo.findByUserId(userId);
        if (existingEmp.some(e => e.companyId === input.companyId)) {
          throw new ValidationError('Số điện thoại này đã được gán cho nhân viên khác trong công ty');
        }
      } else {
        if (!input.password) {
          throw new ValidationError('Mật khẩu là bắt buộc khi tạo tài khoản mới');
        }
        // Tạo user mới
        const userRes = await this.pool.query(
          `INSERT INTO users (phone, email, pass, full_name, birthday, gender, status)
           VALUES ($1, $2, crypt($3, gen_salt('bf')), $4, $5, $6, 1) RETURNING id`,
          [input.phone, input.email || null, input.password, input.fullName, input.birthday || null, input.gender || 3]
        );
        userId = Number(userRes.rows[0].id);
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
    const existingMem = await this.pool.query(
      'SELECT id FROM company_memberships WHERE user_id = $1 AND company_id = $2 AND deleted_at IS NULL',
      [userId, input.companyId]
    );
    if (existingMem.rows.length > 0) {
      await this.pool.query(
        `UPDATE company_memberships 
         SET employee_id = $1, role = $2, active_department_id = $3
         WHERE id = $4`,
        [entity.id, input.role || 2, input.departmentId, existingMem.rows[0].id]
      );
    } else {
      await this.pool.query(
        `INSERT INTO company_memberships (user_id, company_id, employee_id, role, active_department_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, input.companyId, entity.id, input.role || 2, input.departmentId]
      );
    }

    // Lấy thông tin nhân viên đầy đủ
    const fullEmployee = await this.employeeRepo.findById(entity.id);
    return employeeToDto(fullEmployee!);
  }

  async getById(id: number): Promise<EmployeeDto> {
    const entity = await this.employeeRepo.findById(id);
    if (!entity) throw new NotFoundError('Employee not found');
    return employeeToDto(entity);
  }

  async getByCompany(companyId: number): Promise<EmployeeDto[]> {
    const entities = await this.employeeRepo.findByCompanyId(companyId);
    return entities.map(employeeToDto);
  }

  async update(id: number, input: UpdateEmployeeDto): Promise<EmployeeDto> {
    const existing = await this.employeeRepo.findById(id);
    if (!existing) throw new NotFoundError('Employee not found');

    // Cập nhật employees
    await this.employeeRepo.update(id, {
      branchId: input.branchId,
      departmentId: input.departmentId,
      title: input.title,
      status: input.status as any,
    });

    // Cập nhật users
    const userUpdates: string[] = [];
    const userValues: any[] = [];
    let paramIndex = 1;

    if (input.fullName !== undefined) { userUpdates.push(`full_name = $${paramIndex++}`); userValues.push(input.fullName); }
    if (input.phone !== undefined) { userUpdates.push(`phone = $${paramIndex++}`); userValues.push(input.phone); }
    if (input.email !== undefined) { userUpdates.push(`email = $${paramIndex++}`); userValues.push(input.email); }
    if (input.birthday !== undefined) { userUpdates.push(`birthday = $${paramIndex++}`); userValues.push(input.birthday); }
    if (input.gender !== undefined) { userUpdates.push(`gender = $${paramIndex++}`); userValues.push(input.gender); }
    if (input.password !== undefined && input.password !== '') { 
      userUpdates.push(`pass = crypt($${paramIndex++}, gen_salt('bf'))`); 
      userValues.push(input.password); 
    }

    if (userUpdates.length > 0) {
      userValues.push(existing.userId);
      await this.pool.query(
        `UPDATE users SET ${userUpdates.join(', ')} WHERE id = $${paramIndex}`,
        userValues
      );
    }

    // Cập nhật company_memberships
    if (input.role !== undefined || input.departmentId !== undefined) {
      const memUpdates: string[] = [];
      const memValues: any[] = [];
      let memParamIndex = 1;

      if (input.role !== undefined) { memUpdates.push(`role = $${memParamIndex++}`); memValues.push(input.role); }
      if (input.departmentId !== undefined) { memUpdates.push(`active_department_id = $${memParamIndex++}`); memValues.push(input.departmentId); }

      if (memUpdates.length > 0) {
        memValues.push(existing.userId);
        memValues.push(existing.companyId);
        await this.pool.query(
          `UPDATE company_memberships SET ${memUpdates.join(', ')} WHERE user_id = $${memParamIndex} AND company_id = $${memParamIndex + 1} AND deleted_at IS NULL`,
          memValues
        );
      }
    }

    const entity = await this.employeeRepo.findById(id);
    return employeeToDto(entity!);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.employeeRepo.findById(id);
    if (!existing) throw new NotFoundError('Employee not found');
    await this.employeeRepo.softDelete(id);
  }
}
