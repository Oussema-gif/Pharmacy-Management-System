export interface PurchaseItemRequest {
  medicationId: number;
  batchNumber: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  expiryDate: string; // 'yyyy-MM-dd'
}

export interface PurchaseRequest {
  supplierId: number;
  branchId: number;
  items: PurchaseItemRequest[];
}

export interface PurchaseItemDto {
  batchId: number;
  medicationName: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
}

export interface Purchase {
  id: number;
  supplierName: string;
  branchName: string;
  purchaseDate: string;
  totalAmount: number;
  items: PurchaseItemDto[];
}