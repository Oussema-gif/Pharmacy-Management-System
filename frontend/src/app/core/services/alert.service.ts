import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Alert {
  id: number;
  branchId?: number | null;
  branchName?: string | null;
  type: 'LOW_STOCK' | 'EXPIRY' | string;
  message: string;
  read: boolean;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  private baseUrl = 'http://localhost:8080/api/stock/alerts';

  constructor(private http: HttpClient) {}

  getCurrentScopeAlerts(): Observable<Alert[]> {
    return this.http.get<Alert[]>(this.baseUrl);
  }

  getByBranch(branchId: number): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.baseUrl}/branch/${branchId}`);
  }

  markAsRead(alertId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${alertId}/read`, {});
  }
}