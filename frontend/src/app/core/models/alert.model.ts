export interface Alert {
  id: number;
  branchId?: number | null;
  branchName?: string | null;
  type: 'LOW_STOCK' | 'EXPIRY' | string;
  message: string;
  read: boolean;
  createdAt?: string;
}