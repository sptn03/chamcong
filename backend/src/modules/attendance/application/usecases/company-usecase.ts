import { Pool } from 'pg';
import { ICompanyRepository } from '../../domain/repositories';
import { CreateCompanyInput, UpdateCompanyInput } from '../../domain/entities';
import { CompanyDto, companyToDto, CreateCompanyDto, UpdateCompanyDto } from '../dto';
import { ValidationError, NotFoundError } from '../../../../shared/errors';

export class CompanyUsecase {
  constructor(
    private readonly companyRepo: ICompanyRepository,
    private readonly pool?: Pool,
  ) {}

  async create(input: CreateCompanyDto, creatorUserId?: number): Promise<CompanyDto> {
    if (!input.name || !input.code) {
      throw new ValidationError('Name and code are required');
    }

    const existing = await this.companyRepo.findByCode(input.code);
    if (existing) {
      throw new ValidationError('Company code already exists');
    }

    // Nếu có creatorUserId và pool, thực hiện qua transaction
    if (creatorUserId && this.pool) {
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');

        // 1. Tạo công ty
        const companyRes = await client.query(
          `INSERT INTO companies (name, code, timezone)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [input.name, input.code, input.timezone ?? 'Asia/Ho_Chi_Minh']
        );
        const companyRow = companyRes.rows[0];

        // 2. Tạo default branch
        const branchRes = await client.query(
          `INSERT INTO branches (company_id, name, address)
           VALUES ($1, $2, $3)
           RETURNING id`,
          [companyRow.id, 'Trụ sở chính', 'Mặc định']
        );
        const branchId = branchRes.rows[0].id;

        // 3. Tạo default department
        const deptRes = await client.query(
          `INSERT INTO departments (company_id, branch_id, name)
           VALUES ($1, $2, $3)
           RETURNING id`,
          [companyRow.id, branchId, 'Văn phòng']
        );
        const deptId = deptRes.rows[0].id;

        // 4. Tạo hồ sơ nhân viên (status = 1 (active))
        const employeeRes = await client.query(
          `INSERT INTO employees (user_id, company_id, branch_id, department_id, employee_code, title, status)
           VALUES ($1, $2, $3, $4, $5, $6, 1)
           RETURNING id`,
          [creatorUserId, companyRow.id, branchId, deptId, 'ADMIN', 'Quản trị viên']
        );
        const employeeId = employeeRes.rows[0].id;

        // 5. Tạo company membership (role = 1 (admin))
        await client.query(
          `INSERT INTO company_memberships (user_id, company_id, employee_id, role, active_department_id)
           VALUES ($1, $2, $3, 1, $4)`,
          [creatorUserId, companyRow.id, employeeId, deptId]
        );

        await client.query('COMMIT');

        return companyToDto({
          id: Number(companyRow.id),
          name: companyRow.name,
          code: companyRow.code,
          timezone: companyRow.timezone,
          deletedAt: companyRow.deleted_at,
          createdAt: companyRow.created_at,
          updatedAt: companyRow.updated_at,
        });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } else {
      const entity = await this.companyRepo.create(input as CreateCompanyInput);
      return companyToDto(entity);
    }
  }

  async getById(id: number): Promise<CompanyDto> {
    const entity = await this.companyRepo.findById(id);
    if (!entity) throw new NotFoundError('Company not found');
    return companyToDto(entity);
  }

  async getAll(): Promise<CompanyDto[]> {
    const entities = await this.companyRepo.findAll();
    return entities.map(companyToDto);
  }

  async update(id: number, input: UpdateCompanyDto): Promise<CompanyDto> {
    const existing = await this.companyRepo.findById(id);
    if (!existing) throw new NotFoundError('Company not found');

    if (input.code) {
      const duplicate = await this.companyRepo.findByCode(input.code);
      if (duplicate && duplicate.id !== id) {
        throw new ValidationError('Company code already exists');
      }
    }

    const entity = await this.companyRepo.update(id, input as UpdateCompanyInput);
    return companyToDto(entity);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.companyRepo.findById(id);
    if (!existing) throw new NotFoundError('Company not found');
    await this.companyRepo.softDelete(id);
  }
}
