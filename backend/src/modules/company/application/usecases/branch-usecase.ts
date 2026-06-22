import { IBranchRepository } from '../../domain/repositories';
import { BranchDto, branchToDto, CreateBranchDto, UpdateBranchDto } from '../dto';
import { ValidationError, NotFoundError } from '../../../../shared/errors';

export class BranchUsecase {
  constructor(private readonly branchRepo: IBranchRepository) {}

  async create(input: CreateBranchDto): Promise<BranchDto> {
    if (!input.companyId || !input.name) {
      throw new ValidationError('Vui lòng cung cấp đầy đủ thông tin');
    }
    const entity = await this.branchRepo.create(input);
    return branchToDto(entity);
  }

  async getById(id: number): Promise<BranchDto> {
    const entity = await this.branchRepo.findById(id);
    if (!entity) throw new NotFoundError('Không tìm thấy chi nhánh');
    return branchToDto(entity);
  }

  async getByCompany(companyId: number): Promise<BranchDto[]> {
    const entities = await this.branchRepo.findByCompanyId(companyId);
    return entities.map(branchToDto);
  }

  async update(id: number, input: UpdateBranchDto): Promise<BranchDto> {
    const existing = await this.branchRepo.findById(id);
    if (!existing) throw new NotFoundError('Không tìm thấy chi nhánh');
    const entity = await this.branchRepo.update(id, input);
    return branchToDto(entity);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.branchRepo.findById(id);
    if (!existing) throw new NotFoundError('Chi nhánh không tồn tại');
    await this.branchRepo.softDelete(id);
  }
}
