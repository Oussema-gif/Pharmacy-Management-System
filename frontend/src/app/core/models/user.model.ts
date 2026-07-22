export interface User {
  id?: number;
  fullName: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'MANAGER' | 'PHARMACIST' | 'CASHIER';
  branchId?: number | null;
  branchName?: string;
}