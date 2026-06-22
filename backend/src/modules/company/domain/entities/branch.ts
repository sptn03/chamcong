export interface Branch {
  id: number;
  companyId: number;
  name: string;
  address: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBranchInput {
  companyId: number;
  name: string;
  address?: string;
}

export interface UpdateBranchInput {
  name?: string;
  address?: string;
}
