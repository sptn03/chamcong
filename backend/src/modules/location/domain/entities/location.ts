export interface Location {
  id: number;
  companyId: number;
  branchId: number;
  employeeId?: number | null;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  radiusM: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLocationInput {
  companyId: number;
  branchId: number;
  employeeId?: number | null;
  name: string;
  address?: string;
  lat: number;
  lng: number;
  radiusM?: number;
}
