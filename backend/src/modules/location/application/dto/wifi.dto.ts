import { Wifi } from '../../domain/entities';
import { toVNTime } from '../../../../shared/utils/datetime';

export interface WifiDto {
  id: number;
  companyId: number;
  branchId: number;
  name: string | null;
  ssid: string;
  bssid: string | null;
  matchMode: string;
  createdAt: string;
}

export function wifiToDto(entity: Wifi): WifiDto {
  return {
    id: entity.id,
    companyId: entity.companyId,
    branchId: entity.branchId,
    name: entity.name,
    ssid: entity.ssid,
    bssid: entity.bssid,
    matchMode: entity.matchMode,
    createdAt: toVNTime(entity.createdAt),
  };
}

export interface CreateWifiDto {
  companyId: number;
  branchId: number;
  name?: string;
  ssid: string;
  bssid?: string;
  matchMode?: 'ssid' | 'ssid_bssid';
}

export interface UpdateWifiDto {
  name?: string;
  ssid?: string;
  bssid?: string;
  matchMode?: 'ssid' | 'ssid_bssid';
  branchId?: number;
}
