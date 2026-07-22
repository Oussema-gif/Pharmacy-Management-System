export interface Patient {
  id?: number;
  fullName: string;
  phone?: string;
  email?: string;
  address?: string;
  branchId?: number | null;
  branchName?: string | null;
}