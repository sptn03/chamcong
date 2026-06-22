import { Company, CreateCompanyInput, UpdateCompanyInput } from '../entities';

export interface ICompanyRepository {
  findById(id: number): Promise<Company | null>;
  findByCode(code: string): Promise<Company | null>;
  findAll(): Promise<Company[]>;
  findByUserId(userId: number): Promise<Company[]>;
  create(input: CreateCompanyInput): Promise<Company>;
  update(id: number, input: UpdateCompanyInput): Promise<Company>;
  softDelete(id: number): Promise<void>;
  createWithDefaults(input: CreateCompanyInput, creatorUserId: number): Promise<Company>;
}
