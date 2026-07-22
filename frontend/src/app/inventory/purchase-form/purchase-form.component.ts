import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InventoryService } from '../../core/services/inventory.service';
import { SupplierService } from '../../core/services/supplier.service';
import { MedicationService } from '../../core/services/medication.service';
import { BranchService } from '../../core/services/branch.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/auth.service';
import { Supplier } from '../../core/models/supplier.model';
import { Medication } from '../../core/models/medication.model';
import { Branch } from '../../core/models/branch.model';

@Component({
  selector: 'app-purchase-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './purchase-form.component.html',
  styleUrls: []
})
export class PurchaseFormComponent implements OnInit {
  purchaseForm: FormGroup;
  suppliers: Supplier[] = [];
  medications: Medication[] = [];
  branches: Branch[] = [];

  isAdmin = false;
  userBranchId: number | null = null;
  userBranchName = '';

  loadingSuppliers = false;
  loadingMedications = false;
  loadingBranches = false;
  saving = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private supplierService: SupplierService,
    private medicationService: MedicationService,
    private branchService: BranchService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.purchaseForm = this.fb.group({
      supplierId: [null, Validators.required],
      branchId: [null, Validators.required],
      items: this.fb.array([])
    });
  }

  ngOnInit(): void {
    const role = this.authService.getUserRole();
    this.isAdmin = role === 'ADMIN';
    this.userBranchId = this.authService.getUserBranchId();

    this.loadSuppliers();
    this.loadMedications();
    this.initBranchField();
    this.addItem();
  }

  get items(): FormArray {
    return this.purchaseForm.get('items') as FormArray;
  }

  private loadSuppliers(): void {
    this.loadingSuppliers = true;
    this.supplierService.getAll().subscribe({
      next: (data: Supplier[]) => {
        this.suppliers = data;
        this.loadingSuppliers = false;
      },
      error: (err: any) => {
        this.loadingSuppliers = false;
        this.toastService.show('error', err?.error?.message || 'Failed to load suppliers');
      }
    });
  }

  private loadMedications(): void {
    this.loadingMedications = true;
    this.medicationService.getAll().subscribe({
      next: (data: Medication[]) => {
        this.medications = data;
        this.loadingMedications = false;
      },
      error: (err: any) => {
        this.loadingMedications = false;
        this.toastService.show('error', err?.error?.message || 'Failed to load medications');
      }
    });
  }

  private initBranchField(): void {
    if (this.isAdmin) {
      this.loadingBranches = true;
      this.branchService.getAll().subscribe({
        next: (data: Branch[]) => {
          this.branches = data;
          this.loadingBranches = false;
          if (data.length > 0) {
            this.purchaseForm.patchValue({ branchId: data[0].id });
          }
        },
        error: (err: any) => {
          this.loadingBranches = false;
          this.toastService.show('error', 'Failed to load branches');
        }
      });
    } else {
      if (this.userBranchId) {
        this.purchaseForm.patchValue({ branchId: this.userBranchId });
        this.purchaseForm.get('branchId')?.disable();

        this.branchService.getById(this.userBranchId).subscribe({
          next: (branch: Branch) => {
            this.userBranchName = branch.name;
          },
          error: () => {
            this.userBranchName = 'Your Branch';
          }
        });
      }
    }
  }

  addItem(): void {
    const itemGroup = this.fb.group({
      medicationId: [null, Validators.required],
      batchNumber: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      purchasePrice: [0, [Validators.required, Validators.min(0)]],
      sellingPrice: [0, [Validators.required, Validators.min(0)]],
      expiryDate: ['', Validators.required]
    });
    this.items.push(itemGroup);
  }

  removeItem(index: number): void {
    if (this.items.length === 1) {
      this.toastService.show('warning', 'At least one purchase item is required.');
      return;
    }
    this.items.removeAt(index);
  }

  onSubmit(): void {
    if (this.purchaseForm.invalid) {
      this.purchaseForm.markAllAsTouched();
      this.toastService.show('warning', 'Please fill all required fields.');
      return;
    }

    this.saving = true;
    const payload = this.purchaseForm.getRawValue();

    this.inventoryService.createPurchase(payload).subscribe({
      next: () => {
        this.saving = false;
        this.toastService.show('success', 'Purchase saved successfully');
        this.router.navigate(['/inventory']);
      },
      error: (err: any) => {
        this.saving = false;
        this.toastService.show('error', err?.error?.message || 'Failed to create purchase');
      }
    });
  }
}