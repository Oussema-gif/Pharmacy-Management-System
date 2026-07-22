import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Prescription } from '../models/prescription.model';

@Injectable({ providedIn: 'root' })
export class PrescriptionService {
  private baseUrl = 'http://localhost:8080/api/prescriptions';

  constructor(private http: HttpClient) {}

  getAll(branchId?: number): Observable<Prescription[]> {
    let params = new HttpParams();
    if (branchId) {
      params = params.set('branchId', branchId.toString());
    }
    return this.http.get<Prescription[]>(this.baseUrl, { params });
  }

  create(prescription: Prescription): Observable<Prescription> {
    return this.http.post<Prescription>(this.baseUrl, prescription);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}