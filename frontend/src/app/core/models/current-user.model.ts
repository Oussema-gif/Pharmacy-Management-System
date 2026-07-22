export interface CurrentUser {
  id?: number;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'PHARMACIST' | 'CASHIER';
  branchId?: number | null;
  branchName?: string;
}