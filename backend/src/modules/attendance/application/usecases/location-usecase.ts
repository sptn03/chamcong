import { ILocationRepository } from '../../domain/repositories';
import { LocationDto, locationToDto, CreateLocationDto, UpdateLocationDto } from '../dto';
import { ValidationError, NotFoundError } from '../../../../shared/errors';

export class LocationUsecase {
  constructor(private readonly locationRepo: ILocationRepository) {}

  async create(input: CreateLocationDto): Promise<LocationDto> {
    if (!input.companyId || !input.branchId || !input.name || input.lat === undefined || input.lng === undefined) {
      throw new ValidationError('companyId, branchId, name, lat, lng are required');
    }
    if (input.lat < -90 || input.lat > 90) throw new ValidationError('lat must be between -90 and 90');
    if (input.lng < -180 || input.lng > 180) throw new ValidationError('lng must be between -180 and 180');
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
    if (!entity) throw new NotFoundError('Location not found');
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
    if (!existing) throw new NotFoundError('Location not found');
    if (input.lat !== undefined && (input.lat < -90 || input.lat > 90)) throw new ValidationError('lat out of range');
    if (input.lng !== undefined && (input.lng < -180 || input.lng > 180)) throw new ValidationError('lng out of range');
    const entity = await this.locationRepo.update(id, input);
    return locationToDto(entity);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.locationRepo.findById(id);
    if (!existing) throw new NotFoundError('Location not found');
    await this.locationRepo.softDelete(id);
  }
}
