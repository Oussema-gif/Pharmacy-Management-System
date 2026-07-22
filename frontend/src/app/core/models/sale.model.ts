export interface SaleItemRequest {
  batchId: number;
  quantity: number;
}

export interface SaleRequest {
  branchId: number;
  patientId?: number;
  prescriptionId?: number;
  paymentMethod: string;
  discount: number;
  items: SaleItemRequest[];
}

export interface SaleItemResponse {
  batchId: number;
  medicationName: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
}

export interface SaleResponse {
  id: number;
  branchName: string;
  cashierName: string;
  patientName?: string;
  doctorName?: string;
  saleDate: string;
  totalAmount: number;
  discount: number;
  paymentMethod: string;
  items: SaleItemResponse[];
}