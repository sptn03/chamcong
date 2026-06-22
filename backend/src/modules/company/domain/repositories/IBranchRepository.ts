import { Branch, CreateBranchInput, UpdateBranchInput } from '../entities';

export interface IBranchRepository {
  findById(id: number): Promise<Branch | null>;
  findByCompanyId(companyId: number): Promise<Branch[]>;
  create(input: CreateBranchInput): Promise<Branch>;
  update(id: number, input: UpdateBranchInput): Promise<Branch>;
  softDelete(id: number): Promise<void>;
}
