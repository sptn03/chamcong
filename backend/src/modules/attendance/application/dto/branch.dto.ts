import { Branch } from '../../domain/entities';

export interface BranchDto {
  id: number;
  companyId: number;
  name: string;
  address: string | null;
  createdAt: string;
}

export function branchToDto(entity: Branch): BranchDto {
  return {
    id: entity.id,
    companyId: entity.companyId,
    name: entity.name,
    address: entity.address,
    createdAt: entity.createdAt.toISOString(),
  };
}

export interface CreateBranchDto {
  companyId: number;
  name: string;
  address?: string;
}

export interface UpdateBranchDto {
  name?: string;
  address?: string;
}
