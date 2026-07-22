import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupplierService } from '../../core/services/supplier.service';
import { ToastService } from '../../core/services/toast.service';
import { Supplier } from '../../core/models/supplier.model';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './supplier-list.component.html',
  styleUrls: []
})
export class SupplierListComponent implements OnInit {
  suppliers: Supplier[] = [];
  error = '';

  constructor(
    private supplierService: SupplierService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.supplierService.getAll().subscribe({
      next: (data: Supplier[]) => this.suppliers = data,
      error: (err: any) => this.error = 'Failed to load suppliers'
    });
  }

  deleteSupplier(id: number) {
    if (confirm('Are you sure you want to delete this supplier?')) {
      this.supplierService.delete(id).subscribe({
        next: () => {
          this.loadSuppliers();
          this.toastService.show('success', 'Supplier deleted successfully');
        },
        error: (err: any) => {
          const msg = err.error?.message || 'Cannot delete supplier.';
          this.toastService.show('error', msg);
        }
      });
    }
  }
}