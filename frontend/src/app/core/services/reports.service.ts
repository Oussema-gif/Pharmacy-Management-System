import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SalesSummary {
  totalSales: number;
  totalRevenue: number;
  averageSale: number;
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private baseUrl = 'http://localhost:8080/api/sales/branch';

  constructor(private http: HttpClient) {}

  getSalesSummary(branchId: number): Observable<SalesSummary> {
    return this.http.get<any[]>(`${this.baseUrl}/${branchId}`).pipe(
      map(sales => {
        const totalSales = sales.length;
        const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
        return {
          totalSales,
          totalRevenue,
          averageSale: totalSales > 0 ? totalRevenue / totalSales : 0
        };
      })
    );
  }
}