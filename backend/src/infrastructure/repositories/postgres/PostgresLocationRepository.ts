import { Pool, QueryResult } from 'pg';
import { ILocationRepository } from '../../../modules/attendance/domain/repositories';
import { Location, CreateLocationInput } from '../../../modules/attendance/domain/entities';

interface LocationRow {
  id: number;
  company_id: number;
  branch_id: number;
  employee_id: number | null;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  radius_m: number;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

function rowToEntity(row: LocationRow): Location {
  return {
    id: row.id,
    companyId: row.company_id,
    branchId: row.branch_id,
    employeeId: row.employee_id,
    name: row.name,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    radiusM: row.radius_m,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PostgresLocationRepository implements ILocationRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: number): Promise<Location | null> {
    const result: QueryResult<LocationRow> = await this.pool.query(
      'SELECT * FROM locations WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return result.rows.length ? rowToEntity(result.rows[0]) : null;
  }

  async findByBranchId(branchId: number): Promise<Location[]> {
    const result: QueryResult<LocationRow> = await this.pool.query(
      'SELECT * FROM locations WHERE branch_id = $1 AND deleted_at IS NULL ORDER BY name',
      [branchId],
    );
    return result.rows.map(rowToEntity);
  }

  async findByCompanyId(companyId: number): Promise<Location[]> {
    const result: QueryResult<LocationRow> = await this.pool.query(
      'SELECT * FROM locations WHERE company_id = $1 AND deleted_at IS NULL ORDER BY name',
      [companyId],
    );
    return result.rows.map(rowToEntity);
  }

  async create(input: CreateLocationInput): Promise<Location> {
    const result: QueryResult<LocationRow> = await this.pool.query(
      `INSERT INTO locations (company_id, branch_id, employee_id, name, address, lat, lng, radius_m)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [input.companyId, input.branchId, input.employeeId ?? null, input.name, input.address ?? null,
       input.lat, input.lng, input.radiusM ?? 80],
    );
    return rowToEntity(result.rows[0]);
  }

  async update(id: number, input: Partial<CreateLocationInput>): Promise<Location> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.name !== undefined) { fields.push(`name = $${paramIndex++}`); values.push(input.name); }
    if (input.address !== undefined) { fields.push(`address = $${paramIndex++}`); values.push(input.address); }
    if (input.lat !== undefined) { fields.push(`lat = $${paramIndex++}`); values.push(input.lat); }
    if (input.lng !== undefined) { fields.push(`lng = $${paramIndex++}`); values.push(input.lng); }
    if (input.radiusM !== undefined) { fields.push(`radius_m = $${paramIndex++}`); values.push(input.radiusM); }
    if (input.branchId !== undefined) { fields.push(`branch_id = $${paramIndex++}`); values.push(input.branchId); }
    if (input.employeeId !== undefined) { fields.push(`employee_id = $${paramIndex++}`); values.push(input.employeeId); }

    if (fields.length === 0) return this.findById(id) as Promise<Location>;

    values.push(id);
    const result: QueryResult<LocationRow> = await this.pool.query(
      `UPDATE locations SET ${fields.join(', ')} WHERE id = $${paramIndex} AND deleted_at IS NULL RETURNING *`,
      values,
    );
    return rowToEntity(result.rows[0]);
  }

  async softDelete(id: number): Promise<void> {
    await this.pool.query(
      'UPDATE locations SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
  }

  async findActiveLocationsForEmployee(companyId: number, employeeId: number, branchId: number): Promise<Location[]> {
    const result: QueryResult<LocationRow> = await this.pool.query(
      `SELECT *
       FROM locations
       WHERE deleted_at IS NULL
         AND company_id = $1
         AND (employee_id = $2 OR (employee_id IS NULL AND branch_id = $3))`,
      [companyId, employeeId, branchId]
    );
    return result.rows.map(rowToEntity);
  }
}
