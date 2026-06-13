import { IWifiRepository } from '../../domain/repositories';
import { WifiDto, wifiToDto, CreateWifiDto, UpdateWifiDto } from '../dto';
import { ValidationError, NotFoundError } from '../../../../shared/errors';

export class WifiUsecase {
  constructor(private readonly wifiRepo: IWifiRepository) {}

  async create(input: CreateWifiDto): Promise<WifiDto> {
    if (!input.companyId || !input.branchId || !input.ssid) {
      throw new ValidationError('Vui lòng cung cấp đầy đủ thông tin');
    }
    const entity = await this.wifiRepo.create(input);
    return wifiToDto(entity);
  }

  async getById(id: number): Promise<WifiDto> {
    const entity = await this.wifiRepo.findById(id);
    if (!entity) throw new NotFoundError('Không tìm thấy wifi');
    return wifiToDto(entity);
  }

  async getByBranch(branchId: number): Promise<WifiDto[]> {
    const entities = await this.wifiRepo.findByBranchId(branchId);
    return entities.map(wifiToDto);
  }

  async getByCompany(companyId: number): Promise<WifiDto[]> {
    const entities = await this.wifiRepo.findByCompanyId(companyId);
    return entities.map(wifiToDto);
  }

  async update(id: number, input: UpdateWifiDto): Promise<WifiDto> {
    const existing = await this.wifiRepo.findById(id);
    if (!existing) throw new NotFoundError('Không tìm thấy wifi');
    const entity = await this.wifiRepo.update(id, input);
    return wifiToDto(entity);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.wifiRepo.findById(id);
    if (!existing) throw new NotFoundError('Không tìm thấy wifi');
    await this.wifiRepo.softDelete(id);
  }
}
