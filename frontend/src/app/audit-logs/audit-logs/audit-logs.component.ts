import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-logs.component.html',
  styleUrls: []
})
export class AuditLogsComponent implements OnInit {
  logs: any[] = [];
  loading = true;
  error = '';
  filterEntity = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs() {
    this.loading = true;
    const url = this.filterEntity
      ? `http://localhost:8080/api/audit-logs/entity/${this.filterEntity}`
      : 'http://localhost:8080/api/audit-logs';

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.logs = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load audit logs';
        this.loading = false;
      }
    });
  }

  applyFilter() {
    this.loadLogs();
  }
}