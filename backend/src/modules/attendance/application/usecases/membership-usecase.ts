import { IMembershipRepository } from '../../domain/repositories';
import { MembershipDto, membershipToDto, CreateMembershipDto } from '../dto';
import { ValidationError, NotFoundError } from '../../../../shared/errors';

export class MembershipUsecase {
  constructor(private readonly membershipRepo: IMembershipRepository) {}

  async create(input: CreateMembershipDto): Promise<MembershipDto> {
    if (!input.userId || !input.companyId) {
      throw new ValidationError('userId and companyId are required');
    }

    const existing = await this.membershipRepo.findActive(input.userId, input.companyId);
    if (existing) {
      throw new ValidationError('User already has an active membership in this company');
    }

    const entity = await this.membershipRepo.create(input);
    return membershipToDto(entity);
  }

  async getById(id: number): Promise<MembershipDto> {
    const entity = await this.membershipRepo.findById(id);
    if (!entity) throw new NotFoundError('Membership not found');
    return membershipToDto(entity);
  }

  async getByUser(userId: number): Promise<MembershipDto[]> {
    const entities = await this.membershipRepo.findByUserId(userId);
    return entities.map(membershipToDto);
  }

  async getByCompany(companyId: number): Promise<MembershipDto[]> {
    const entities = await this.membershipRepo.findByCompanyId(companyId);
    return entities.map(membershipToDto);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.membershipRepo.findById(id);
    if (!existing) throw new NotFoundError('Membership not found');
    await this.membershipRepo.softDelete(id);
  }
}
