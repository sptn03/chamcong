import { Branch } from '../../domain/entities';
import { toVNTime } from '../../../../shared/utils/datetime';

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
    createdAt: toVNTime(entity.createdAt),
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
