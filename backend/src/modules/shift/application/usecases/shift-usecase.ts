import { IShiftRepository } from '../../domain/repositories';
import { ShiftDto, shiftToDto, CreateShiftDto, UpdateShiftDto } from '../dto';
import { ValidationError, NotFoundError } from '../../../../shared/errors';

export class ShiftUsecase {
  constructor(private readonly shiftRepo: IShiftRepository) {}

  async create(input: CreateShiftDto): Promise<ShiftDto> {
    if (!input.companyId || !input.name || !input.startTime || !input.endTime) {
      throw new ValidationError('Vui lòng cung cấp đầy đủ thông tin');
    }
    if (input.weekdays < 1 || input.weekdays > 127) throw new ValidationError('weekdays must be 1-127');
    const entity = await this.shiftRepo.create(input);
    return shiftToDto(entity);
  }

  async getById(id: number): Promise<ShiftDto> {
    const entity = await this.shiftRepo.findById(id);
    if (!entity) throw new NotFoundError('Shift not found');
    return shiftToDto(entity);
  }

  async getByCompany(companyId: number): Promise<ShiftDto[]> {
    const entities = await this.shiftRepo.findByCompanyId(companyId);
    return entities.map(shiftToDto);
  }

  async update(id: number, input: UpdateShiftDto): Promise<ShiftDto> {
    const existing = await this.shiftRepo.findById(id);
    if (!existing) throw new NotFoundError('Không tìm thấy ca làm việc');
    if (input.weekdays !== undefined && (input.weekdays < 1 || input.weekdays > 127)) {
      throw new ValidationError('Vui lòng cung cấp đầy đủ thông tin');
    }
    const entity = await this.shiftRepo.update(id, input);
    return shiftToDto(entity);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.shiftRepo.findById(id);
    if (!existing) throw new NotFoundError('Không tìm thấy ca làm việc');
    await this.shiftRepo.softDelete(id);
  }
}
