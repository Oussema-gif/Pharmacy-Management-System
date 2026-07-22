import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InventoryService } from '../../core/services/inventory.service';
import { BranchService } from '../../core/services/branch.service';
import { AuthService } from '../../core/auth.service';               // ✅ new
import { ToastService } from '../../core/services/toast.service';
import { Batch } from '../../core/models/batch.model';
import { Purchase } from '../../core/models/purchase.model';
import { Branch } from '../../core/models/branch.model';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './inventory-list.component.html',
  styleUrls: []
})
export class InventoryListComponent implements OnInit {
  branches: Branch[] = [];
  selectedBranchId: number | null = null;

  // ── role helper ──
  isAdmin = false;
  userBranchId: number | null = null;
  userBranchName = '';

  stock: Batch[] = [];
  purchases: Purchase[] = [];
  activeTab: 'stock' | 'purchases' = 'stock';

  loadingStock = false;
  loadingPurchases = false;
  loadingBranches = false;
  error = '';

  constructor(
    private inventoryService: InventoryService,
    private branchService: BranchService,
    private authService: AuthService,             // ✅ injected
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.getUserRole() === 'ADMIN';
    this.userBranchId = this.authService.getUserBranchId();
    this.loadBranches();
  }

  private loadBranches(): void {
    this.loadingBranches = true;

    if (this.isAdmin) {
      // Admin: load all branches and let them switch
      this.branchService.getAll().subscribe({
        next: (data: Branch[]) => {
          this.branches = data;
          this.loadingBranches = false;
          if (data.length > 0) {
            this.selectedBranchId = data[0].id!;
            this.loadStock();
            this.loadPurchases();
          }
        },
        error: (err: any) => {
          this.loadingBranches = false;
          this.error = 'Failed to load branches';
          this.toastService.show('error', this.error);
        }
      });
    } else {
      // Non‑admin: only their own branch
      if (this.userBranchId) {
        this.branchService.getById(this.userBranchId).subscribe({
          next: (branch: Branch) => {
            this.branches = [branch];          // put it in the array for the dropdown
            this.userBranchName = branch.name;
            this.selectedBranchId = branch.id!;
            this.loadingBranches = false;
            this.loadStock();
            this.loadPurchases();
          },
          error: (err: any) => {
            this.loadingBranches = false;
            this.error = 'Failed to load your branch';
            this.toastService.show('error', this.error);
          }
        });
      }
    }
  }

  onBranchChange(): void {
    if (this.selectedBranchId) {
      this.loadStock();
      this.loadPurchases();
    }
  }

  loadStock(): void {
    if (!this.selectedBranchId) return;
    this.loadingStock = true;
    this.error = '';

    this.inventoryService.getStockByBranch(this.selectedBranchId).subscribe({
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
    if (!this.selectedBranchId) return;
    this.loadingPurchases = true;
    this.error = '';

    this.inventoryService.getPurchasesByBranch(this.selectedBranchId).subscribe({
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
    this.loadStock();
    this.loadPurchases();
  }

  get scopeLabel(): string {
    if (this.isAdmin) {
      const selectedBranch = this.branches.find(b => b.id === this.selectedBranchId);
      return selectedBranch ? `Branch: ${selectedBranch.name}` : 'No branch selected';
    }
    return this.userBranchName ? `Branch: ${this.userBranchName}` : 'Your Branch';
  }
}