import { ICompanyRepository } from '../../domain/repositories';
import { CreateCompanyInput, UpdateCompanyInput } from '../../domain/entities';
import { CompanyDto, companyToDto, CreateCompanyDto, UpdateCompanyDto } from '../dto';
import { ValidationError, NotFoundError } from '../../../../shared/errors';

export class CompanyUsecase {
  constructor(
    private readonly companyRepo: ICompanyRepository,
  ) {}

  async create(input: CreateCompanyDto, creatorUserId?: number): Promise<CompanyDto> {
    if (!input.name || !input.code) {
      throw new ValidationError('Vui lòng cung cấp đầy đủ thông tin');
    }

    const existing = await this.companyRepo.findByCode(input.code);
    if (existing) {
      throw new ValidationError('Mã công ty đã tồn tại');
    }

    if (creatorUserId) {
      const entity = await this.companyRepo.createWithDefaults(input as CreateCompanyInput, creatorUserId);
      return companyToDto(entity);
    } else {
      const entity = await this.companyRepo.create(input as CreateCompanyInput);
      return companyToDto(entity);
    }
  }

  async getById(id: number): Promise<CompanyDto> {
    const entity = await this.companyRepo.findById(id);
    if (!entity) throw new NotFoundError('Không tìm thấy công ty');
    return companyToDto(entity);
  }

  async getAll(userId?: number): Promise<CompanyDto[]> {
    const entities = userId
      ? await this.companyRepo.findByUserId(userId)
      : await this.companyRepo.findAll();
    return entities.map(companyToDto);
  }

  async update(id: number, input: UpdateCompanyDto): Promise<CompanyDto> {
    const existing = await this.companyRepo.findById(id);
    if (!existing) throw new NotFoundError('Không tìm thấy công ty');

    if (input.code) {
      const duplicate = await this.companyRepo.findByCode(input.code);
      if (duplicate && duplicate.id !== id) {
        throw new ValidationError('Mã công ty đã tồn tại');
      }
    }

    const entity = await this.companyRepo.update(id, input as UpdateCompanyInput);
    return companyToDto(entity);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.companyRepo.findById(id);
    if (!existing) throw new NotFoundError('Không tìm thấy công ty');
    await this.companyRepo.softDelete(id);
  }
}
