import { IDeviceRepository } from '../../domain/repositories';
import { DeviceDto, deviceToDto, RegisterDeviceDto, UpdateDeviceStatusDto } from '../dto';
import { ValidationError, NotFoundError } from '../../../../shared/errors';

export class DeviceUsecase {
  constructor(private readonly deviceRepo: IDeviceRepository) {}

  async register(input: RegisterDeviceDto): Promise<DeviceDto> {
    if (!input.userId || !input.deviceUid || !input.platform) {
      throw new ValidationError('Vui lòng cung cấp đầy đủ thông tin');
    }
    const entity = await this.deviceRepo.create(input);
    return deviceToDto(entity);
  }

  async getById(id: number): Promise<DeviceDto> {
    const entity = await this.deviceRepo.findById(id);
    if (!entity) throw new NotFoundError('Không tìm thấy thiết bị');
    return deviceToDto(entity);
  }

  async getByUser(userId: number): Promise<DeviceDto[]> {
    const entities = await this.deviceRepo.findByUserId(userId);
    return entities.map(deviceToDto);
  }

  async getAll(companyId?: number): Promise<DeviceDto[]> {
    const entities = await this.deviceRepo.findAll(companyId);
    return entities.map(deviceToDto);
  }

  async updateStatus(id: number, input: UpdateDeviceStatusDto): Promise<void> {
    const existing = await this.deviceRepo.findById(id);
    if (!existing) throw new NotFoundError('Không tìm thấy thiết bị');
    await this.deviceRepo.updateStatus(id, input.status, input.reviewedBy, input.rejectionReason);
  }
}
