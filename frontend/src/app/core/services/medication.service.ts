import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medication } from '../models/medication.model';

@Injectable({ providedIn: 'root' })
export class MedicationService {
  private baseUrl = 'http://localhost:8080/api/medications';

  constructor(private http: HttpClient) {}

  getAll(branchId?: number): Observable<Medication[]> {
    let params = new HttpParams();
    if (branchId) {
      params = params.set('branchId', branchId.toString());
    }
    return this.http.get<Medication[]>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Medication> {
    return this.http.get<Medication>(`${this.baseUrl}/${id}`);
  }

  create(medication: Medication): Observable<Medication> {
    return this.http.post<Medication>(this.baseUrl, medication);
  }

  update(id: number, medication: Medication): Observable<Medication> {
    return this.http.put<Medication>(`${this.baseUrl}/${id}`, medication);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getByBarcode(barcode: string): Observable<Medication> {
    return this.http.get<Medication>(`${this.baseUrl}/barcode/${encodeURIComponent(barcode)}`);
  }
}