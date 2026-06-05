import { Wifi, CreateWifiInput } from '../entities';

export interface IWifiRepository {
  findById(id: number): Promise<Wifi | null>;
  findByBranchId(branchId: number): Promise<Wifi[]>;
  findByCompanyId(companyId: number): Promise<Wifi[]>;
  findBySsid(ssid: string, bssid?: string): Promise<Wifi | null>;
  create(input: CreateWifiInput): Promise<Wifi>;
  update(id: number, input: Partial<CreateWifiInput>): Promise<Wifi>;
  softDelete(id: number): Promise<void>;
}
