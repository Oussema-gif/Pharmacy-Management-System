export interface Medication {
  id?: number;
  name: string;
  genericName?: string;
  category?: string;
  unit?: string;
  barcode?: string;
  branchId?: number | null;
  branchName?: string | null;
}