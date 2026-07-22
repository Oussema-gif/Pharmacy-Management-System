import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RecentSale {
  id: number;
  saleDate: string;
  patientName: string;
  totalAmount: number;
  branchName?: string | null;
}

export interface DashboardAlert {
  type: 'LOW_STOCK' | 'EXPIRY' | string;
  message: string;
}

export interface DashboardStats {
  totalBranches: number;
  totalUsers: number;
  totalSales: number;
  lowStockItems: number;
  activeAlerts: number;
  recentSales: RecentSale[];
  alerts: DashboardAlert[];
}

export interface SalesTrendPoint {
  date: string;
  revenue: number;
  transactions: number;
}

export interface TopMedication {
  medicationName: string;
  quantitySold: number;
  revenue: number;
}

export interface DashboardAnalytics {
  days: number;
  salesTrend: SalesTrendPoint[];
  topMedications: TopMedication[];
  scope?: 'ALL_BRANCHES' | 'MY_BRANCH';
  branchName?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly baseUrl = 'http://localhost:8080/api/dashboard';

  constructor(private readonly http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/stats`);
  }

  getAnalytics(days: 7 | 30 | 90): Observable<DashboardAnalytics> {
    return this.http.get<DashboardAnalytics>(`${this.baseUrl}/analytics`, {
      params: { days }
    });
  }
}