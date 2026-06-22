import { Company } from '../../domain/entities';
import { toVNTime } from '../../../../shared/utils/datetime';

export interface CompanyDto {
  id: number;
  name: string;
  code: string;
  timezone: string;
  createdAt: string;
}

export function companyToDto(entity: Company): CompanyDto {
  return {
    id: entity.id,
    name: entity.name,
    code: entity.code,
    timezone: entity.timezone,
    createdAt: toVNTime(entity.createdAt),
  };
}

export interface CreateCompanyDto {
  name: string;
  code: string;
  timezone?: string;
}

export interface UpdateCompanyDto {
  name?: string;
  code?: string;
  timezone?: string;
}
