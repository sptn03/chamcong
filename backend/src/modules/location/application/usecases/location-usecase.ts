import { ILocationRepository } from '../../domain/repositories';
import { LocationDto, locationToDto, CreateLocationDto, UpdateLocationDto } from '../dto';
import { ValidationError, NotFoundError } from '../../../../shared/errors';

export class LocationUsecase {
  constructor(private readonly locationRepo: ILocationRepository) {}

  async create(input: CreateLocationDto): Promise<LocationDto> {
    if (!input.companyId || !input.branchId || !input.name || input.lat === undefined || input.lng === undefined) {
      throw new ValidationError('Vui lòng cung cấp đầy đủ thông tin');
    }
    if (input.lat < -90 || input.lat > 90) throw new ValidationError('lat phải nằm trong khoảng -90 và 90');
    if (input.lng < -180 || input.lng > 180) throw new ValidationError('lng phải nằm trong khoảng -180 và 180');
    const entity = await this.locationRepo.create({
      companyId: input.companyId,
      branchId: input.branchId,
      employeeId: input.employeeId,
      name: input.name,
      address: input.address,
      lat: input.lat,
      lng: input.lng,
      radiusM: input.radiusM
    });
    return locationToDto(entity);
  }

  async getById(id: number): Promise<LocationDto> {
    const entity = await this.locationRepo.findById(id);
    if (!entity) throw new NotFoundError('Không tìm thấy địa điểm');
    return locationToDto(entity);
  }

  async getByBranch(branchId: number): Promise<LocationDto[]> {
    const entities = await this.locationRepo.findByBranchId(branchId);
    return entities.map(locationToDto);
  }

  async getByCompany(companyId: number): Promise<LocationDto[]> {
    const entities = await this.locationRepo.findByCompanyId(companyId);
    return entities.map(locationToDto);
  }

  async update(id: number, input: UpdateLocationDto): Promise<LocationDto> {
    const existing = await this.locationRepo.findById(id);
    if (!existing) throw new NotFoundError('Không tìm thấy địa điểm');
    if (input.lat !== undefined && (input.lat < -90 || input.lat > 90)) throw new ValidationError('lat phải nằm trong khoảng -90 và 90');
    if (input.lng !== undefined && (input.lng < -180 || input.lng > 180)) throw new ValidationError('lng phải nằm trong khoảng -180 và 180');
    const entity = await this.locationRepo.update(id, input);
    return locationToDto(entity);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.locationRepo.findById(id);
    if (!existing) throw new NotFoundError('Không tìm thấy địa điểm');
    await this.locationRepo.softDelete(id);
  }
}
