import { Location, CreateLocationInput } from '../entities';

export interface ILocationRepository {
  findById(id: number): Promise<Location | null>;
  findByBranchId(branchId: number): Promise<Location[]>;
  findByCompanyId(companyId: number): Promise<Location[]>;
  create(input: CreateLocationInput): Promise<Location>;
  update(id: number, input: Partial<CreateLocationInput>): Promise<Location>;
  softDelete(id: number): Promise<void>;
  findActiveLocationsForEmployee(companyId: number, employeeId: number, branchId: number): Promise<Location[]>;
}
