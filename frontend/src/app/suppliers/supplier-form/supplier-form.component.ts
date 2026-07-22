import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SupplierService } from '../../core/services/supplier.service';
import { ToastService } from '../../core/services/toast.service';
import { Supplier } from '../../core/models/supplier.model';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './supplier-form.component.html',
  styleUrls: []
})
export class SupplierFormComponent implements OnInit {
  supplierForm: FormGroup;
  isEdit = false;
  supplierId: number | null = null;
  error = '';

  constructor(
    private fb: FormBuilder,
    private supplierService: SupplierService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.supplierForm = this.fb.group({
      name: ['', Validators.required],
      contactPerson: [''],
      phone: [''],
      email: [''],
      address: ['']
    });
  }

  ngOnInit(): void {
    this.supplierId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.supplierId) {
      this.isEdit = true;
      this.supplierService.getById(this.supplierId).subscribe({
        next: (supplier: Supplier) => this.supplierForm.patchValue(supplier),
        error: (err: any) => this.error = 'Supplier not found'
      });
    }
  }

  onSubmit() {
    if (this.supplierForm.invalid) return;

    const supplierData: Supplier = this.supplierForm.value;
    const request = this.isEdit && this.supplierId
      ? this.supplierService.update(this.supplierId, supplierData)
      : this.supplierService.create(supplierData);

    request.subscribe({
      next: () => {
        this.toastService.show('success', this.isEdit ? 'Supplier updated' : 'Supplier created');
        this.router.navigate(['/suppliers']);
      },
      error: (err: any) => {
        const msg = err.error?.message || 'Save failed';
        this.error = msg;
        this.toastService.show('error', msg);
      }
    });
  }
}