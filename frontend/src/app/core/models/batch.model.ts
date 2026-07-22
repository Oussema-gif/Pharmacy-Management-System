export interface Batch {
  id?: number;
  medicationId: number;
  medicationName: string;
  branchId: number;
  branchName: string;
  supplierId?: number;
  supplierName?: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string; // LocalDate ISO string
  purchasePrice: number;
  sellingPrice: number;
}