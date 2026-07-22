import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Batch } from '../models/batch.model';
import { Purchase, PurchaseRequest } from '../models/purchase.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getStockByBranch(branchId: number): Observable<Batch[]> {
    return this.http.get<Batch[]>(`${this.baseUrl}/stock/branch/${branchId}`);
  }

  getBatchesByMedication(branchId: number, medicationId: number): Observable<Batch[]> {
    return this.http.get<Batch[]>(
      `${this.baseUrl}/stock/branch/${branchId}/medication/${medicationId}`
    );
  }

  getPurchasesByBranch(branchId: number): Observable<Purchase[]> {
    return this.http.get<Purchase[]>(`${this.baseUrl}/purchases/branch/${branchId}`);
  }

  createPurchase(request: PurchaseRequest): Observable<Purchase> {
    return this.http.post<Purchase>(`${this.baseUrl}/purchases`, request);
  }

  updateBatch(id: number, batch: Batch): Observable<Batch> {
    return this.http.put<Batch>(`${this.baseUrl}/batch-management/${id}`, batch);
  }
}