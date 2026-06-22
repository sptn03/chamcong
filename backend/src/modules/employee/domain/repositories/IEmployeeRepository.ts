import { Employee, CreateEmployeeInput, UpdateEmployeeInput } from '../entities';

export interface IEmployeeRepository {
  findById(id: number): Promise<Employee | null>;
  findByUserId(userId: number): Promise<Employee[]>;
  findByCompanyId(companyId: number): Promise<Employee[]>;
  findByCode(companyId: number, employeeCode: string): Promise<Employee | null>;
  create(input: CreateEmployeeInput): Promise<Employee>;
  update(id: number, input: UpdateEmployeeInput): Promise<Employee>;
  softDelete(id: number): Promise<void>;
  findByIds(ids: number[]): Promise<Employee[]>;
}
