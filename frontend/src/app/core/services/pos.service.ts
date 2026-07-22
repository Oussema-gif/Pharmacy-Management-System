import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AvailableBatch {
  id: number;
  batchNumber: string;
  medicationId: number;
  medicationName: string;
  quantity: number;
  sellingPrice: number;
  expiryDate?: string | null;
}

export interface SaleItemRequest {
  batchId: number;
  quantity: number;
}

export interface SaleRequest {
  branchId?: number | null;
  patientId?: number | null;
  prescriptionId?: number | null;
  paymentMethod: string;
  discount: number;
  items: SaleItemRequest[];
}

export interface SaleResponse {
  id: number;
  branchName?: string | null;
  cashierName?: string | null;
  patientName?: string | null;
  doctorName?: string | null;
  saleDate: string;
  totalAmount: number;
  discount: number;
  paymentMethod: string;
  items: {
    batchId: number;
    medicationName: string;
    batchNumber: string;
    quantity: number;
    unitPrice: number;
  }[];
}

@Injectable({ providedIn: 'root' })
export class PosService {
  private salesUrl = 'http://localhost:8080/api/sales';
  private stockUrl = 'http://localhost:8080/api/stock';
  private patientsUrl = 'http://localhost:8080/api/patients';
  private prescriptionsUrl = 'http://localhost:8080/api/prescriptions';

  constructor(private http: HttpClient) {}

  createSale(payload: SaleRequest): Observable<SaleResponse> {
    return this.http.post<SaleResponse>(this.salesUrl, payload);
  }

  getBatchesByMedicationAndBranch(medicationId: number, branchId: number): Observable<AvailableBatch[]> {
    return this.http.get<AvailableBatch[]>(
      `${this.stockUrl}/branch/${branchId}/medication/${medicationId}`
    );
  }

  getAllPatients(): Observable<any[]> {
    return this.http.get<any[]>(this.patientsUrl);
  }

  getAllPrescriptions(): Observable<any[]> {
    return this.http.get<any[]>(this.prescriptionsUrl);
  }
}