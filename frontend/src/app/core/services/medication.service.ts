import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medication } from '../models/medication.model';

@Injectable({ providedIn: 'root' })
export class MedicationService {
  private baseUrl = 'http://localhost:8080/api/medications';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Medication[]> {
    return this.http.get<Medication[]>(this.baseUrl);
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