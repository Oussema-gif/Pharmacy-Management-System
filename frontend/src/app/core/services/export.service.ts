import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ExportService {

  /** Converts an array of objects to CSV format and downloads it */
  downloadCsv(data: any[], filename: string, columns: string[]) {
    const header = columns.join(',') + '\n';
    const rows = data.map(row =>
      columns.map(col => this.escapeCsvValue(row[col] ?? '')).join(',')
    ).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private escapeCsvValue(value: any): string {
    const str = String(value).replace(/"/g, '""');
    return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
  }
}