export interface Company {
  id: number;
  name: string;
  code: string;
  timezone: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCompanyInput {
  name: string;
  code: string;
  timezone?: string;
}

export interface UpdateCompanyInput {
  name?: string;
  code?: string;
  timezone?: string;
}
