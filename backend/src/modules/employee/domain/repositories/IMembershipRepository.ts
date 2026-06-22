import { CompanyMembership, CreateMembershipInput } from '../entities';

export interface IMembershipRepository {
  findById(id: number): Promise<CompanyMembership | null>;
  findByUserId(userId: number): Promise<CompanyMembership[]>;
  findByCompanyId(companyId: number): Promise<CompanyMembership[]>;
  findActive(userId: number, companyId: number): Promise<CompanyMembership | null>;
  create(input: CreateMembershipInput): Promise<CompanyMembership>;
  softDelete(id: number): Promise<void>;
  update(id: number, input: Partial<CreateMembershipInput>): Promise<CompanyMembership>;
}
