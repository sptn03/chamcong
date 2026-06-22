import { Shift, CreateShiftInput } from '../entities';

export interface IShiftRepository {
  findById(id: number): Promise<Shift | null>;
  findByIds(ids: number[]): Promise<Shift[]>;
  findByCompanyId(companyId: number): Promise<Shift[]>;
  create(input: CreateShiftInput): Promise<Shift>;
  update(id: number, input: Partial<CreateShiftInput>): Promise<Shift>;
  softDelete(id: number): Promise<void>;
}
