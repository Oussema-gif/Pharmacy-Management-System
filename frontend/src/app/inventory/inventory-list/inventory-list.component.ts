import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InventoryService } from '../../core/services/inventory.service';
import { ToastService } from '../../core/services/toast.service';
import { Batch } from '../../core/models/batch.model';
import { Purchase } from '../../core/models/purchase.model';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inventory-list.component.html',
  styleUrls: []
})
export class InventoryListComponent implements OnInit {
  branchId = 1;
  branchName = 'Main Branch';

  stock: Batch[] = [];
  purchases: Purchase[] = [];
  activeTab: 'stock' | 'purchases' = 'stock';

  loadingStock = false;
  loadingPurchases = false;
  error = '';

  constructor(
    private inventoryService: InventoryService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadStock();
    this.loadPurchases();
  }

  loadStock(): void {
    this.loadingStock = true;
    this.error = '';

    this.inventoryService.getStockByBranch(this.branchId).subscribe({
      next: (data: Batch[]) => {
        this.stock = data.filter((b: Batch) => b.quantity > 0);
        this.loadingStock = false;
      },
      error: (err: any) => {
        this.stock = [];
        this.loadingStock = false;
        this.error = err?.error?.message || err?.error || 'Failed to load stock';
        this.toastService.show('error', this.error);
      }
    });
  }

  loadPurchases(): void {
    this.loadingPurchases = true;
    this.error = '';

    this.inventoryService.getPurchasesByBranch(this.branchId).subscribe({
      next: (data: Purchase[]) => {
        this.purchases = data;
        this.loadingPurchases = false;
      },
      error: (err: any) => {
        this.purchases = [];
        this.loadingPurchases = false;
        this.error = err?.error?.message || err?.error || 'Failed to load purchases';
        this.toastService.show('error', this.error);
      }
    });
  }

  editBatch(batch: Batch) {
    const newQuantity = prompt('Enter new quantity (0 to remove)', batch.quantity.toString());
    if (newQuantity !== null) {
      batch.quantity = parseInt(newQuantity, 10);
      this.inventoryService.updateBatch(batch.id!, batch).subscribe({
        next: () => {
          this.loadStock();
          this.toastService.show('success', 'Batch updated successfully');
        },
        error: (err: any) => {
          this.toastService.show('error', err.error?.message || 'Failed to update batch');
        }
      });
    }
  }

  refresh(): void {
    if (this.activeTab === 'stock') {
      this.loadStock();
    } else {
      this.loadPurchases();
    }
  }

  get scopeLabel(): string {
    return `Branch: ${this.branchName}`;
  }
}