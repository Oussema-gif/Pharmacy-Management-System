import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ReportsService, SalesSummary } from '../../core/services/reports.service';
import { ToastService } from '../../core/services/toast.service';
import { ExportService } from '../../core/services/export.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrls: []
})
export class ReportsComponent implements OnInit {
  summary: SalesSummary | null = null;
  branchId = 1;
  loading = true;
  error = '';

  constructor(
    private reportsService: ReportsService,
    private toastService: ToastService,
    private exportService: ExportService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport() {
    this.loading = true;
    this.reportsService.getSalesSummary(this.branchId).subscribe({
      next: (data: SalesSummary) => {
        this.summary = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.error = 'Failed to load reports';
        this.toastService.show('error', this.error);
      }
    });
  }

  exportSales() {
    this.http.get<any[]>(`http://localhost:8080/api/sales/branch/${this.branchId}`).subscribe({
      next: (sales) => {
        const columns = ['id', 'branchName', 'cashierName', 'patientName', 'saleDate', 'totalAmount', 'discount', 'paymentMethod'];
        this.exportService.downloadCsv(sales, 'sales_report', columns);
        this.toastService.show('success', 'Sales report exported');
      },
      error: () => this.toastService.show('error', 'Failed to export sales')
    });
  }
}