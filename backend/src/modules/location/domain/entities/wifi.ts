export type WifiMatchMode = 'ssid' | 'ssid_bssid';

export interface Wifi {
  id: number;
  companyId: number;
  branchId: number;
  name: string | null;
  ssid: string;
  bssid: string | null;
  matchMode: WifiMatchMode;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWifiInput {
  companyId: number;
  branchId: number;
  name?: string;
  ssid: string;
  bssid?: string;
  matchMode?: WifiMatchMode;
}
