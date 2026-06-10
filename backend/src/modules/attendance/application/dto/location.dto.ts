import { Location } from '../../domain/entities';
import { toVNTime } from '../../../../shared/utils/datetime';

export interface LocationDto {
  id: number;
  companyId: number;
  branchId: number;
  employeeId?: number | null;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  radiusM: number;
  createdAt: string;
}

export function locationToDto(entity: Location): LocationDto {
  return {
    id: entity.id,
    companyId: entity.companyId,
    branchId: entity.branchId,
    employeeId: entity.employeeId,
    name: entity.name,
    address: entity.address,
    lat: entity.lat,
    lng: entity.lng,
    radiusM: entity.radiusM,
    createdAt: toVNTime(entity.createdAt),
  };
}

export interface CreateLocationDto {
  companyId: number;
  branchId: number;
  employeeId?: number | null;
  name: string;
  address?: string;
  lat: number;
  lng: number;
  radiusM?: number;
}

export interface UpdateLocationDto {
  name?: string;
  address?: string;
  lat?: number;
  lng?: number;
  radiusM?: number;
  branchId?: number;
  employeeId?: number | null;
}

