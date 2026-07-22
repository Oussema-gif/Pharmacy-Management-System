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
import { ToastService } from '../../core/services/toast.service';
import { Supplier } from '../../core/models/supplier.model';
import { Medication } from '../../core/models/medication.model';

@Component({
  selector: 'app-purchase-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './purchase-form.component.html',
  styleUrls: []
})
export class PurchaseFormComponent implements OnInit {
  branchId = 1;
  branchLabel = 'Main Branch';

  purchaseForm: FormGroup;
  suppliers: Supplier[] = [];
  medications: Medication[] = [];

  loadingSuppliers = false;
  loadingMedications = false;
  saving = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private supplierService: SupplierService,
    private medicationService: MedicationService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.purchaseForm = this.fb.group({
      supplierId: [null, Validators.required],
      branchId: [this.branchId, Validators.required],
      items: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadSuppliers();
    this.loadMedications();
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
        this.toastService.show(
          'error',
          err?.error?.message || err?.error || 'Failed to load suppliers'
        );
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
        this.toastService.show(
          'error',
          err?.error?.message || err?.error || 'Failed to load medications'
        );
      }
    });
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

    const payload = {
      ...this.purchaseForm.value,
      branchId: this.branchId
    };

    this.inventoryService.createPurchase(payload).subscribe({
      next: () => {
        this.saving = false;
        this.toastService.show('success', 'Purchase saved successfully');
        this.router.navigate(['/inventory']);
      },
      error: (err: any) => {
        this.saving = false;
        this.toastService.show(
          'error',
          err?.error?.message || err?.error || 'Failed to create purchase'
        );
      }
    });
  }
}